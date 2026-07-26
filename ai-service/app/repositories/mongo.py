"""MongoDB access (async, Motor).

The AI service reads the catalog/orders/reviews written by the Express backend
and owns a small number of AI-only collections (events, recommendations cache,
chat sessions, analytics rollups). It holds NO write path to the commerce core.
"""

from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger("app.mongo")


class MongoRepository:
    def __init__(self, settings: Settings) -> None:
        self._client: AsyncIOMotorClient = AsyncIOMotorClient(
            settings.mongo_uri, serverSelectionTimeoutMS=5000, uuidRepresentation="standard"
        )
        self._db: AsyncIOMotorDatabase = self._client[settings.mongo_db]

    @property
    def db(self) -> AsyncIOMotorDatabase:
        return self._db

    # --- Commerce collections (read-only) ---
    @property
    def products(self):
        return self._db["products"]

    @property
    def reviews(self):
        return self._db["reviews"]

    @property
    def orders(self):
        return self._db["orders"]

    @property
    def order_items(self):
        return self._db["orderitems"]

    # --- AI-owned collections ---
    @property
    def events(self):
        return self._db["events"]

    @property
    def recommendations(self):
        return self._db["recommendations"]

    @property
    def chat_sessions(self):
        return self._db["chatsessions"]

    @property
    def review_summaries(self):
        return self._db["reviewsummaries"]

    @property
    def analytics_rollups(self):
        return self._db["analyticsrollups"]

    async def ping(self) -> bool:
        await self._client.admin.command("ping")
        return True

    async def ensure_indexes(self) -> None:
        """Indexes for the AI-owned collections. Idempotent."""
        await self.events.create_index([("userId", 1), ("ts", -1)])
        await self.events.create_index([("type", 1), ("ts", -1)])
        await self.events.create_index([("productId", 1)])
        await self.recommendations.create_index([("userId", 1), ("section", 1)])
        await self.chat_sessions.create_index([("sessionId", 1)], unique=True)

    def close(self) -> None:
        self._client.close()
