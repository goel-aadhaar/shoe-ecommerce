"""Semantic search + similar-products.

Flow: embed the query -> filtered ANN in Qdrant -> hydrate full product docs
from Mongo -> return scored results. The pieces are all wired here; it returns
live results as soon as the catalog is indexed into Qdrant (Phase 2 indexer).
"""

from __future__ import annotations

import asyncio

from qdrant_client import models

from app.clients.embeddings import Embedder
from app.core.config import Settings
from app.core.logging import get_logger
from app.repositories.catalog_repo import CatalogRepository
from app.repositories.qdrant_repo import QdrantRepository
from app.schemas.common import ScoredProduct
from app.schemas.search import (
    SearchFilters,
    SearchResponse,
    SemanticSearchRequest,
    SimilarProductsRequest,
)

logger = get_logger("app.search")


class SearchService:
    def __init__(
        self,
        embedder: Embedder,
        qdrant: QdrantRepository,
        catalog: CatalogRepository,
        settings: Settings,
    ) -> None:
        self._embedder = embedder
        self._qdrant = qdrant
        self._catalog = catalog
        self._settings = settings

    def _build_filter(self, f: SearchFilters | None) -> models.Filter | None:
        if not f:
            return None
        must: list[models.Condition] = []
        if f.category:
            # Payload stores the lower-cased category NAME (the indexer resolves
            # the ObjectId), because callers supply a word like "sneakers".
            must.append(
                models.FieldCondition(
                    key="category", match=models.MatchValue(value=f.category.lower())
                )
            )
        if f.brand:
            must.append(models.FieldCondition(key="brand", match=models.MatchValue(value=f.brand)))
        if f.gender:
            must.append(models.FieldCondition(key="gender", match=models.MatchValue(value=f.gender)))
        if f.colour:
            # Payload holds lower-cased colour tokens (split from `color`/`colors`);
            # MatchValue against an array field matches any element.
            must.append(
                models.FieldCondition(
                    key="colors", match=models.MatchValue(value=f.colour.lower())
                )
            )
        if f.inStock:
            must.append(models.FieldCondition(key="inStock", match=models.MatchValue(value=True)))
        if f.minPrice is not None or f.maxPrice is not None:
            must.append(
                models.FieldCondition(
                    key="price", range=models.Range(gte=f.minPrice, lte=f.maxPrice)
                )
            )
        return models.Filter(must=must) if must else None

    async def _hydrate(self, hits: list[dict]) -> list[ScoredProduct]:
        # Qdrant point ids are UUIDs; the real product id lives in the payload.
        by_pid = {(h.get("payload") or {}).get("productId"): h for h in hits}
        ids = [pid for pid in by_pid if pid]
        products = {p["id"]: p for p in await self._catalog.get_products(ids)}
        out: list[ScoredProduct] = []
        for pid, h in by_pid.items():
            p = products.get(pid)
            if not p:
                continue
            out.append(ScoredProduct(score=round(float(h["score"]), 4), **_project(p)))
        return out

    async def _embed(self, text: str) -> list[float]:
        """Embed off the event loop.

        SentenceTransformer inference is synchronous, CPU-bound work; running it
        inline would block every other request on this worker for its duration.
        """
        return await asyncio.to_thread(self._embedder.embed_one, text)

    async def semantic_search(self, req: SemanticSearchRequest) -> SearchResponse:
        vector = await self._embed(req.query)
        hits = await self._qdrant.search(
            self._qdrant.products,
            vector,
            limit=req.limit,
            query_filter=self._build_filter(req.filters),
        )
        results = await self._hydrate(hits)
        return SearchResponse(query=req.query, results=results, count=len(results))

    async def similar_products(self, req: SimilarProductsRequest) -> SearchResponse:
        product = await self._catalog.get_product(req.productId)
        anchor = f"{product['name']} {product.get('brand','')}" if product else req.productId
        vector = await self._embed(anchor)
        hits = await self._qdrant.search(self._qdrant.products, vector, limit=req.limit + 1)
        # Exclude the anchor by its productId payload — Qdrant point ids are
        # derived UUIDs and never equal the Mongo id.
        hits = [
            h for h in hits if (h.get("payload") or {}).get("productId") != req.productId
        ][: req.limit]
        results = await self._hydrate(hits)
        return SearchResponse(query=f"similar:{req.productId}", results=results, count=len(results))


def _project(p: dict) -> dict:
    keys = ("id", "name", "brand", "price", "gender", "color", "thumbnail", "rating", "category")
    return {k: p.get(k) for k in keys}
