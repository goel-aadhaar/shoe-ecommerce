"""Offline training pipeline: Mongo behavioural data -> RecModel artifact.

Runs off the request path (Celery beat nightly, or the CLI on demand). Reads the
event stream and order baskets, fits the item-item CF, mines association rules,
and computes time-decayed popularity/trending, then persists a versioned model.
"""

from __future__ import annotations

from app.core.config import Settings
from app.core.logging import get_logger
from app.ml.artifacts import ArtifactStore, RecModel
from app.ml.association import mine_association_rules
from app.ml.collaborative import ItemCF
from app.ml.interactions import build_interaction_matrix
from app.ml.popularity import normalize, popularity_scores, trending_scores
from app.repositories.mongo import MongoRepository

logger = get_logger("app.training")


async def _load_events(mongo: MongoRepository) -> list[dict]:
    cursor = mongo.events.find(
        {}, {"userId": 1, "productId": 1, "weight": 1, "ts": 1, "type": 1, "_id": 0}
    )
    return [
        {
            "userId": str(d["userId"]) if d.get("userId") else None,
            "productId": str(d["productId"]) if d.get("productId") else None,
            "weight": d.get("weight", 1.0),
            "ts": d.get("ts"),
            "type": d.get("type"),
        }
        async for d in cursor
    ]


async def _load_baskets(mongo: MongoRepository) -> list[list[str]]:
    """Group order items into baskets (list of product-id lists)."""
    baskets: dict[str, list[str]] = {}
    cursor = mongo.order_items.find({}, {"orderId": 1, "productId": 1, "_id": 0})
    async for d in cursor:
        oid = str(d.get("orderId"))
        pid = str(d.get("productId"))
        if oid and pid:
            baskets.setdefault(oid, []).append(pid)
    return list(baskets.values())


async def train_recommender(mongo: MongoRepository, settings: Settings) -> RecModel:
    events = await _load_events(mongo)
    baskets = await _load_baskets(mongo)
    logger.info("training_data", extra={"events": len(events), "baskets": len(baskets)})

    im = build_interaction_matrix(events)
    item_cf = ItemCF.train(im, topk=settings.cf_topk)
    rules = mine_association_rules(
        baskets, min_support=settings.arm_min_support, min_lift=settings.arm_min_lift
    )
    popularity = normalize(popularity_scores(events, settings.rec_half_life_days))
    trending = normalize(trending_scores(events, settings.rec_trending_window_days))

    model = RecModel(
        version=RecModel.new_version(),
        item_cf=item_cf,
        rules=rules,
        popularity=popularity,
        trending=trending,
        item_ids=im.item_ids,
        stats={
            "events": len(events),
            "baskets": len(baskets),
            "users": im.n_users,
            "items": im.n_items,
            "arm_method": rules.method,
        },
    )
    path = ArtifactStore(settings.artifacts_dir).save(model)
    logger.info("training_complete", extra={"version": model.version, "path": str(path), **model.stats})
    return model
