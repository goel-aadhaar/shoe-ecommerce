"""Celery tasks. Async work is bridged via ``asyncio.run`` inside the task."""

from __future__ import annotations

import asyncio

from app.core.logging import get_logger
from app.workers.celery_app import celery
from app.workers.indexer import reindex_catalog

logger = get_logger("app.tasks")


@celery.task(name="app.workers.tasks.reindex_catalog_task", bind=True, max_retries=3)
def reindex_catalog_task(self) -> dict:
    try:
        return asyncio.run(reindex_catalog())
    except Exception as exc:  # noqa: BLE001
        logger.exception("reindex_failed")
        raise self.retry(exc=exc) from exc


@celery.task(name="app.workers.tasks.train_models_task", bind=True, max_retries=2)
def train_models_task(self) -> dict:
    """Retrain the recommendation model (item-item CF + association rules +
    popularity) from Mongo behavioural data and persist a versioned artifact."""
    from app.core.config import get_settings
    from app.ml.training import train_recommender
    from app.repositories.mongo import MongoRepository

    async def _run() -> dict:
        settings = get_settings()
        mongo = MongoRepository(settings)
        try:
            model = await train_recommender(mongo, settings)
            return {"status": "ok", "version": model.version, **model.stats}
        finally:
            mongo.close()

    try:
        return asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001
        logger.exception("train_models_failed")
        raise self.retry(exc=exc) from exc


@celery.task(name="app.workers.tasks.compute_rollups_task", bind=True, max_retries=2)
def compute_rollups_task(self) -> dict:
    """Snapshot the analytics summary into ``analyticsRollups`` so the dashboard
    can show historical trends without re-scanning the full event stream."""
    import datetime as dt

    from app.core.config import get_settings
    from app.core.container import build_container

    async def _run() -> dict:
        c = build_container(get_settings())
        try:
            summary = await c.analytics.summary(days=1)
            today = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
            await c.mongo.analytics_rollups.update_one(
                {"date": today},
                {"$set": {
                    "date": today,
                    "engagement": summary.engagement.model_dump(),
                    "rates": summary.rates.model_dump(),
                    "funnel": [f.model_dump() for f in summary.funnel],
                    "modelVersion": summary.modelVersion,
                    "updatedAt": dt.datetime.now(dt.timezone.utc),
                }},
                upsert=True,
            )
            return {"status": "ok", "date": today, "events": summary.engagement.events}
        finally:
            await c.shutdown()

    try:
        return asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001
        logger.exception("rollups_failed")
        raise self.retry(exc=exc) from exc


@celery.task(name="app.workers.tasks.ingest_knowledge_task", bind=True, max_retries=3)
def ingest_knowledge_task(self) -> dict:
    """Build the KB from current products + global docs and upsert into Qdrant."""
    import asyncio
    from app.core.config import get_settings
    from app.core.container import build_container
    from app.rag import build_all_chunks
    from app.workers.indexer import kb_point_id

    async def _run() -> dict:
        s = get_settings()
        c = build_container(s)
        try:
            dim = len(c.embedder.embed_one("dimension probe"))
            await c.qdrant.ensure_collection(c.qdrant.knowledge, dim)
            products = [d async for d in c.catalog.iter_all_products()]
            chunks = build_all_chunks(products)
            if not chunks:
                return {"status": "ok", "ingested": 0}
            await c.qdrant.upsert(
                c.qdrant.knowledge,
                # Qdrant point ids must be uint64 or UUID — raw strings are
                # rejected, which silently broke every nightly KB refresh.
                [kb_point_id(ch.source, ch.title, ch.body) for ch in chunks],
                c.embedder.embed([ch.body for ch in chunks]),
                [
                    {"source": ch.source, "title": ch.title, "body": ch.body,
                     "productId": ch.product_id}
                    for ch in chunks
                ],
            )
            return {"status": "ok", "ingested": len(chunks), "products": len(products), "dim": dim}
        finally:
            await c.shutdown()

    try:
        return asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001
        logger.exception("ingest_knowledge_failed")
        raise self.retry(exc=exc) from exc
