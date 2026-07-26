"""Recommendation engine — hybrid, artifact-backed, cold-start safe.

Serves the eight personalized homepage sections by blending the trained model
(item-item CF + association rules + time-decayed popularity/trending) with
fresh per-user signals from the event stream and content similarity from Qdrant.
When no model or no user signal exists, every section degrades gracefully to the
popularity floor so the homepage is never empty.

Serving imports no heavy ML deps — the trained artifact holds precomputed
neighbour lists and rule maps; only the offline trainer needs numpy/sklearn.
"""

from __future__ import annotations

from bson import ObjectId

from app.clients.embeddings import Embedder
from app.core.config import Settings
from app.core.logging import get_logger
from app.ml.artifacts import ArtifactStore, RecModel
from app.ml.ranking import blend
from app.repositories.catalog_repo import CatalogRepository, serialize_product
from app.repositories.mongo import MongoRepository
from app.repositories.qdrant_repo import QdrantRepository
from app.repositories.redis_repo import RedisRepository
from app.schemas.common import ScoredProduct
from app.schemas.recommend import (
    HomeResponse,
    HomeSection,
    RecommendRequest,
    RecommendResponse,
    RerankRequest,
    RerankResponse,
    SectionBlock,
)

logger = get_logger("app.recommender")

_TITLES = {
    HomeSection.recommended_for_you: "Recommended For You",
    HomeSection.continue_shopping: "Continue Shopping",
    HomeSection.frequently_bought_together: "Frequently Bought Together",
    HomeSection.customers_also_bought: "Customers Also Bought",
    HomeSection.trending: "Trending Shoes",
    HomeSection.recently_viewed: "Recently Viewed",
    HomeSection.based_on_your_style: "Based On Your Style",
    HomeSection.new_arrivals: "New Arrivals",
}
_REASON = {
    HomeSection.recommended_for_you: "Picked for you",
    HomeSection.continue_shopping: "You were looking at this",
    HomeSection.frequently_bought_together: "Often bought together",
    HomeSection.customers_also_bought: "Shoppers also bought",
    HomeSection.trending: "Trending now",
    HomeSection.recently_viewed: "You viewed this",
    HomeSection.based_on_your_style: "Matches your style",
    HomeSection.new_arrivals: "Just arrived",
}

_PROJECT_KEYS = ("id", "name", "brand", "price", "gender", "color", "thumbnail", "rating", "category")

# Section attribute -> the boolean flag the imported catalog documents use.
_ATTRIBUTE_FLAG_FOR = {
    "trending": "isTrending",
    "newArrival": "isNewArrival",
    "bestSeller": "isFeatured",
}


def _project(p: dict) -> dict:
    return {k: p.get(k) for k in _PROJECT_KEYS}


def _id_variants(value: str) -> list:
    variants: list = [value]
    if ObjectId.is_valid(value):
        variants.append(ObjectId(value))
    return variants


class RecommenderService:
    def __init__(
        self,
        catalog: CatalogRepository,
        mongo: MongoRepository,
        redis: RedisRepository,
        embedder: Embedder,
        qdrant: QdrantRepository,
        store: ArtifactStore,
        settings: Settings,
    ) -> None:
        self._catalog = catalog
        self._mongo = mongo
        self._redis = redis
        self._embedder = embedder
        self._qdrant = qdrant
        self._store = store
        self._settings = settings

    # ------------------------------------------------------------------ public
    async def recommend(self, req: RecommendRequest) -> RecommendResponse:
        model = self._store.load_latest()
        items = await self._section(req.section, req.userId, req.limit, req.context, model)
        return RecommendResponse(
            section=req.section, items=items,
            modelVersion=model.version if model else "cold-start-v1",
        )

    async def home(self, user_id: str | None, limit: int = 10) -> HomeResponse:
        model = self._store.load_latest()
        wanted = [HomeSection.recommended_for_you, HomeSection.trending, HomeSection.new_arrivals]
        if user_id:
            recent = await self._recent_products(user_id, ["view", "click"], 1)
            if recent:
                wanted.insert(1, HomeSection.recently_viewed)
                wanted.insert(2, HomeSection.based_on_your_style)
            cart = await self._recent_products(user_id, ["add_to_cart"], 1)
            if cart:
                wanted.append(HomeSection.continue_shopping)

        sections: list[SectionBlock] = []
        for section in wanted:
            items = await self._section(section, user_id, limit, {}, model)
            if items:
                sections.append(
                    SectionBlock(section=section, title=_TITLES[section], items=items)
                )
        return HomeResponse(userId=user_id, sections=sections)

    async def rerank(self, req: RerankRequest) -> RerankResponse:
        model = self._store.load_latest()
        products = {p["id"]: p for p in await self._catalog.get_products(req.productIds)}
        interactions = await self._user_interactions(req.userId) if req.userId else {}

        cf: dict[str, float] = {}
        if model and interactions:
            # Score the requested products specifically. Taking a global top-k
            # would usually return items that aren't in productIds at all,
            # leaving most of the list being reranked at cf=0.
            requested = set(req.productIds)
            ranked = model.item_cf.recommend(
                interactions, k=len(model.item_cf.item_ids) or len(requested), exclude_seen=False
            )
            cf = {pid: score for pid, score in ranked if pid in requested}
        pop = model.popularity if model else {}
        trend = model.trending if model else {}
        in_stock = {pid for pid, p in products.items() if (p.get("stock") or 0) > 0} or None

        scored = blend(
            set(req.productIds), cf=cf, popularity=pop, trending=trend, in_stock=in_stock
        )
        items = [
            ScoredProduct(score=round(s, 4), **_project(products[pid]))
            for pid, s in scored if pid in products
        ]
        return RerankResponse(items=items)

    # --------------------------------------------------------------- sections
    async def _section(
        self, section: HomeSection, user_id: str | None, limit: int, context: dict,
        model: RecModel | None,
    ) -> list[ScoredProduct]:
        if section == HomeSection.trending:
            if model and model.trending:
                return await self._hydrate(_top(model.trending, limit), _REASON[section])
            return await self._popular(limit, attribute="trending")

        if section == HomeSection.new_arrivals:
            return await self._popular(limit, attribute="newArrival", reason=_REASON[section])

        if section == HomeSection.recently_viewed and user_id:
            ids = await self._recent_products(user_id, ["view", "click"], limit)
            return await self._hydrate([(i, 1.0) for i in ids], _REASON[section])

        if section == HomeSection.continue_shopping and user_id:
            ids = await self._recent_products(user_id, ["add_to_cart"], limit)
            return await self._hydrate([(i, 1.0) for i in ids], _REASON[section])

        if section == HomeSection.recommended_for_you:
            return await self._personalized(user_id, limit, model)

        if section == HomeSection.based_on_your_style and user_id:
            seeds = await self._recent_products(user_id, ["view", "click", "purchase"], 5)
            content = await self._content_recommend(seeds, limit, set(seeds))
            if content:
                return await self._hydrate(content, _REASON[section])
            return await self._personalized(user_id, limit, model)

        if section in (HomeSection.customers_also_bought, HomeSection.frequently_bought_together):
            anchor = context.get("productId") or await self._latest_anchor(user_id)
            if anchor and model:
                if section == HomeSection.frequently_bought_together:
                    scored = model.rules.complements([anchor], k=limit)
                else:
                    scored = model.item_cf.similar(anchor, k=limit)
                if scored:
                    return await self._hydrate(scored, _REASON[section])
            return await self._popular(limit)

        # Fallback for any personalized section without signal.
        return await self._popular(limit)

    async def _personalized(
        self, user_id: str | None, limit: int, model: RecModel | None
    ) -> list[ScoredProduct]:
        interactions = await self._user_interactions(user_id) if user_id else {}
        if model and interactions:
            cf = dict(model.item_cf.recommend(interactions, k=limit * 3))
            candidates = set(cf) | set(_top_ids(model.trending, limit))
            scored = blend(
                candidates, cf=cf, popularity=model.popularity, trending=model.trending,
                exclude=set(interactions),
            )[:limit]
            if scored:
                return await self._hydrate(scored, _REASON[HomeSection.recommended_for_you])
        if model and model.popularity:
            return await self._hydrate(
                _top(model.popularity, limit), _REASON[HomeSection.recommended_for_you]
            )
        return await self._popular(limit)

    # --------------------------------------------------------------- signals
    async def _user_interactions(self, user_id: str | None, limit: int = 200) -> dict[str, float]:
        if not user_id:
            return {}
        cursor = (
            self._mongo.events.find(
                {"userId": {"$in": _id_variants(user_id)}, "productId": {"$ne": None}},
                {"productId": 1, "weight": 1, "_id": 0},
            ).sort("ts", -1).limit(limit)
        )
        interactions: dict[str, float] = {}
        async for d in cursor:
            pid = str(d.get("productId"))
            interactions[pid] = interactions.get(pid, 0.0) + float(d.get("weight", 1.0) or 1.0)
        return interactions

    async def _recent_products(
        self, user_id: str | None, types: list[str], limit: int
    ) -> list[str]:
        if not user_id:
            return []
        # Cap server-side: without a limit this scans the user's entire event
        # history whenever their distinct-product count is below `limit`.
        # Over-fetch enough to still find `limit` DISTINCT products after dupes.
        cursor = (
            self._mongo.events.find(
                {"userId": {"$in": _id_variants(user_id)}, "type": {"$in": types},
                 "productId": {"$ne": None}},
                {"productId": 1, "_id": 0},
            ).sort("ts", -1).limit(max(limit * 20, 200))
        )
        seen: list[str] = []
        seen_set: set[str] = set()
        async for d in cursor:
            pid = str(d.get("productId"))
            if pid not in seen_set:
                seen_set.add(pid)
                seen.append(pid)
            if len(seen) >= limit:
                break
        return seen

    async def _latest_anchor(self, user_id: str | None) -> str | None:
        ids = await self._recent_products(user_id, ["purchase", "add_to_cart", "view"], 1)
        return ids[0] if ids else None

    async def _content_recommend(
        self, seed_ids: list[str], limit: int, exclude: set[str]
    ) -> list[tuple[str, float]]:
        if not seed_ids:
            return []
        seeds = await self._catalog.get_products(seed_ids[:5])
        if not seeds:
            return []
        text = " . ".join(
            f"{p.get('name', '')} {p.get('brand', '')} {p.get('color', '')}" for p in seeds
        )
        try:
            vector = self._embedder.embed_one(text)
            hits = await self._qdrant.search(
                self._qdrant.products, vector, limit=limit + len(exclude) + 5
            )
        except Exception:  # noqa: BLE001
            return []
        out: list[tuple[str, float]] = []
        for h in hits:
            pid = (h.get("payload") or {}).get("productId")
            if pid and pid not in exclude:
                out.append((pid, float(h["score"])))
            if len(out) >= limit:
                break
        return out

    # --------------------------------------------------------------- helpers
    async def _hydrate(
        self, scored: list[tuple[str, float]], reason: str | None
    ) -> list[ScoredProduct]:
        ids = [pid for pid, _ in scored]
        if not ids:
            return []
        products = {p["id"]: p for p in await self._catalog.get_products(ids)}
        out: list[ScoredProduct] = []
        for pid, score in scored:
            p = products.get(pid)
            if p:
                out.append(ScoredProduct(score=round(float(score), 4), reason=reason, **_project(p)))
        return out

    async def _popular(
        self, limit: int, attribute: str | None = None, reason: str = "Popular right now"
    ) -> list[ScoredProduct]:
        # The catalog holds two document shapes (see catalog_repo): the declared
        # `attributes[]`/`rating` and the imported `isTrending`/`averageRating`.
        # Match either, or these sections come back empty on real data.
        query: dict = {}
        if attribute:
            flag = _ATTRIBUTE_FLAG_FOR.get(attribute)
            alternatives: list[dict] = [{"attributes": attribute}]
            if flag:
                alternatives.append({flag: True})
            query = {"$or": alternatives}

        cursor = (
            self._mongo.products.find(query)
            .sort([("averageRating", -1), ("rating", -1), ("totalReviews", -1), ("ratedBy", -1)])
            .limit(limit)
        )
        docs = [serialize_product(d) async for d in cursor]
        return [
            ScoredProduct(
                score=round((d.get("rating") or 0) / 5.0, 4), reason=reason, **_project(d)
            )
            for d in docs
        ]


def _top(scores: dict[str, float], k: int) -> list[tuple[str, float]]:
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:k]


def _top_ids(scores: dict[str, float], k: int) -> list[str]:
    return [i for i, _ in _top(scores, k)]
