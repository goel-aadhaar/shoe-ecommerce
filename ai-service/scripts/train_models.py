"""CLI: train the recommendation model from behavioural data in Mongo.

    python -m scripts.train_models

Reads events + order baskets, fits item-item CF, mines association rules, and
computes popularity/trending, then persists a versioned artifact that the API
serves. Run after seeding interactions (scripts/seed_interactions.py).
"""

from __future__ import annotations

import asyncio

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.ml.training import train_recommender
from app.repositories.mongo import MongoRepository

logger = get_logger("scripts.train_models")


async def main() -> None:
    configure_logging()
    settings = get_settings()
    mongo = MongoRepository(settings)
    try:
        model = await train_recommender(mongo, settings)
        print(f"Trained recmodel {model.version}")
        print(f"  stats: {model.stats}")
    finally:
        mongo.close()


if __name__ == "__main__":
    asyncio.run(main())
