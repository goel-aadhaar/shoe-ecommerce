"""Behavioural event ingestion + analytics.

Ingestion feeds every downstream ML model. The dashboard reads aggregated
metrics computed from the same ``events`` stream — funnel counts, CTR /
conversion, top products, search behaviour, and copilot usage.
"""

from __future__ import annotations

import datetime as dt

from app.analytics import (
    compute_rates,
    daily_series_pipeline,
    engagement_pipeline,
    funnel_pipeline,
    top_products_pipeline,
    top_searches_pipeline,
)
from app.core.config import Settings
from app.core.exceptions import BadRequestError
from app.core.logging import get_logger
from app.ml.artifacts import ArtifactStore
from app.repositories.catalog_repo import CatalogRepository
from app.repositories.mongo import MongoRepository
from app.schemas.analytics import (
    AnalyticsSummary,
    CopilotUsage,
    DayPoint,
    Engagement,
    FunnelStage,
    Rates,
    SearchTerm,
    TopProduct,
)
from app.schemas.events import EventAck, EventIn

logger = get_logger("app.analytics")


class AnalyticsService:
    # Per-event weights; also used by CF / ranking as intent strength.
    _WEIGHTS = {"view": 1.0, "click": 1.5, "add_to_cart": 3.0, "purchase": 5.0, "search": 0.5}

    def __init__(
        self,
        mongo: MongoRepository,
        catalog: CatalogRepository,
        store: ArtifactStore,
        settings: Settings,
    ) -> None:
        self._mongo = mongo
        self._catalog = catalog
        self._store = store
        self._settings = settings

    async def record_event(self, event: EventIn) -> EventAck:
        doc = event.model_dump()
        doc["weight"] = self._WEIGHTS.get(event.type.value, 1.0)
        doc["ts"] = dt.datetime.now(dt.timezone.utc)
        await self._mongo.events.insert_one(doc)
        return EventAck(accepted=True)

    # ---------------------------------------------------------------- summary
    async def summary(self, days: int = 30) -> AnalyticsSummary:
        funnel_rows = await self._agg(funnel_pipeline(days))
        funnel_map = {r["stage"]: r["count"] for r in funnel_rows}

        top_rows = await self._agg(top_products_pipeline(days))
        top_products = await self._hydrate_top(top_rows)

        daily_rows = await self._agg(daily_series_pipeline(days))
        daily = [
            DayPoint(
                day=r["day"],
                total=r["total"],
                counts={c["type"]: c["count"] for c in r.get("counts", [])},
            )
            for r in daily_rows
        ]

        search_rows = await self._agg(top_searches_pipeline(days))
        engagement_rows = await self._agg(engagement_pipeline(days))
        engagement = Engagement(**engagement_rows[0]) if engagement_rows else Engagement()

        model = self._store.load_latest()

        return AnalyticsSummary(
            windowDays=days,
            generatedAt=dt.datetime.now(dt.timezone.utc).isoformat(),
            modelVersion=model.version if model else None,
            engagement=engagement,
            rates=Rates(**compute_rates(funnel_map)),
            funnel=[
                FunnelStage(stage=s, count=funnel_map.get(s, 0))
                for s in ("view", "click", "add_to_cart", "purchase")
            ],
            topProducts=top_products,
            topSearches=[SearchTerm(**r) for r in search_rows],
            daily=daily,
            copilot=await self._copilot_usage(),
        )

    async def get_metric(self, metric: str, days: int = 30) -> dict:
        """Single-metric access for narrower dashboard widgets."""
        pipelines = {
            "funnel": funnel_pipeline,
            "top-products": top_products_pipeline,
            "daily": daily_series_pipeline,
            "top-searches": top_searches_pipeline,
            "engagement": engagement_pipeline,
        }
        builder = pipelines.get(metric)
        if builder is None:
            raise BadRequestError(
                f"Unknown metric '{metric}'. Valid: {', '.join(sorted(pipelines))}."
            )
        return {"metric": metric, "windowDays": days, "data": await self._agg(builder(days))}

    # ---------------------------------------------------------------- helpers
    async def _agg(self, pipeline: list[dict]) -> list[dict]:
        try:
            return [d async for d in self._mongo.events.aggregate(pipeline)]
        except Exception as exc:  # noqa: BLE001
            logger.warning("aggregation_failed", extra={"err": str(exc)})
            return []

    async def _hydrate_top(self, rows: list[dict]) -> list[TopProduct]:
        rows = [r for r in rows if r.get("productId")]
        if not rows:
            return []
        products = {
            p["id"]: p
            for p in await self._catalog.get_products([r["productId"] for r in rows])
        }
        out: list[TopProduct] = []
        for r in rows:
            p = products.get(r["productId"], {})
            out.append(TopProduct(
                productId=r["productId"],
                name=p.get("name"), brand=p.get("brand"),
                thumbnail=p.get("thumbnail"), price=p.get("price"),
                score=round(float(r.get("score", 0)), 2),
                views=r.get("views", 0), carts=r.get("carts", 0),
                purchases=r.get("purchases", 0),
            ))
        return out

    async def _copilot_usage(self) -> CopilotUsage:
        try:
            sessions = await self._mongo.chat_sessions.count_documents({})
            rows = [
                d async for d in self._mongo.chat_sessions.aggregate([
                    {"$project": {"n": {"$size": {"$ifNull": ["$messages", []]}}}},
                    {"$group": {"_id": None, "total": {"$sum": "$n"}}},
                ])
            ]
            messages = rows[0]["total"] if rows else 0
            return CopilotUsage(sessions=sessions, messages=messages)
        except Exception:  # noqa: BLE001
            return CopilotUsage()
