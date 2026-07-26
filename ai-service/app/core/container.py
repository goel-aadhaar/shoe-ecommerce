"""Dependency-injection container.

A single composition root. Built once in the app lifespan and stored on
``app.state.container``; routers pull collaborators from it via ``app/api/deps.py``.
Clients are constructed eagerly but connect lazily, so the service boots even
when a dependency is temporarily down — readiness is reported separately.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from app.clients.embeddings import Embedder, build_embedder
from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.llm.client import LLMClient
from app.ml.artifacts import ArtifactStore
from app.repositories.catalog_repo import CatalogRepository
from app.repositories.mongo import MongoRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.qdrant_repo import QdrantRepository
from app.repositories.redis_repo import RedisRepository
from app.services.analytics_service import AnalyticsService
from app.services.content_service import ContentService
from app.services.copilot_service import CopilotService
from app.services.rag_service import RagService
from app.services.recommender_service import RecommenderService
from app.services.search_service import SearchService

logger = get_logger("app.container")


@dataclass
class Container:
    settings: Settings

    # repositories / clients
    mongo: MongoRepository = field(init=False)
    redis: RedisRepository = field(init=False)
    qdrant: QdrantRepository = field(init=False)
    catalog: CatalogRepository = field(init=False)
    orders: OrderRepository = field(init=False)
    embedder: Embedder = field(init=False)
    llm: LLMClient = field(init=False)
    artifact_store: ArtifactStore = field(init=False)

    # services
    search: SearchService = field(init=False)
    recommender: RecommenderService = field(init=False)
    copilot: CopilotService = field(init=False)
    rag: RagService = field(init=False)
    content: ContentService = field(init=False)
    analytics: AnalyticsService = field(init=False)

    def __post_init__(self) -> None:
        s = self.settings
        self.mongo = MongoRepository(s)
        self.redis = RedisRepository(s)
        self.qdrant = QdrantRepository(s)
        self.catalog = CatalogRepository(self.mongo)
        self.embedder = build_embedder(s)
        self.llm = LLMClient(s)
        self.artifact_store = ArtifactStore(s.artifacts_dir)

        self.search = SearchService(self.embedder, self.qdrant, self.catalog, s)
        self.recommender = RecommenderService(
            self.catalog, self.mongo, self.redis, self.embedder, self.qdrant,
            self.artifact_store, s,
        )
        self.content = ContentService(self.catalog, self.llm, self.mongo, self.artifact_store, s)
        self.rag = RagService(self.embedder, self.qdrant, self.llm, self.redis, s)
        self.orders = OrderRepository(self.mongo)
        self.copilot = CopilotService(
            self.llm, self.search, self.recommender, self.content, self.redis, s,
            self.mongo, self.orders, self.rag,
        )
        self.analytics = AnalyticsService(self.mongo, self.catalog, self.artifact_store, s)

    async def startup(self) -> None:
        """Best-effort warm-up. Non-fatal so the API can serve /health while a
        dependency recovers; /ready reflects the real state."""
        try:
            await self.mongo.ensure_indexes()
        except Exception as exc:  # noqa: BLE001
            logger.warning("index_ensure_failed", extra={"err": str(exc)})

        # Load the embedding model now, off the event loop. It is lazily loaded
        # on first use otherwise, which puts a ~10s download/init directly on
        # the first shopper's search or copilot turn.
        async def _warm_embedder() -> None:
            try:
                await asyncio.to_thread(self.embedder.embed_one, "warmup")
                logger.info("embedder_warm", extra={"provider": self.settings.embeddings_provider})
            except Exception as exc:  # noqa: BLE001
                logger.warning("embedder_warm_failed", extra={"err": str(exc)})

        self._warmup_task = asyncio.create_task(_warm_embedder())

    async def readiness(self) -> dict[str, bool]:
        async def _safe(coro) -> bool:
            try:
                return bool(await asyncio.wait_for(coro, timeout=3))
            except Exception:  # noqa: BLE001
                return False

        mongo_ok, redis_ok, qdrant_ok = await asyncio.gather(
            _safe(self.mongo.ping()), _safe(self.redis.ping()), _safe(self.qdrant.ping())
        )
        return {"mongo": mongo_ok, "redis": redis_ok, "qdrant": qdrant_ok}

    async def shutdown(self) -> None:
        task = getattr(self, "_warmup_task", None)
        if task is not None and not task.done():
            task.cancel()

        for closer in (self.redis.aclose(), self.qdrant.aclose(), self.llm.aclose()):
            try:
                await closer
            except Exception:  # noqa: BLE001
                pass
        self.mongo.close()


def build_container(settings: Settings | None = None) -> Container:
    return Container(settings or get_settings())
