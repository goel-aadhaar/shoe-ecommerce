"""Qdrant access (async) — vector storage + filtered similarity search."""

from __future__ import annotations

from typing import Any

from qdrant_client import AsyncQdrantClient, models

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger("app.qdrant")


class QdrantRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        self.products = settings.qdrant_products_collection
        self.knowledge = settings.qdrant_knowledge_collection

    @property
    def client(self) -> AsyncQdrantClient:
        return self._client

    async def ping(self) -> bool:
        await self._client.get_collections()
        return True

    async def ensure_collection(self, name: str, dim: int) -> None:
        exists = await self._client.collection_exists(name)
        if not exists:
            logger.info("creating_qdrant_collection", extra={"collection": name, "dim": dim})
            await self._client.create_collection(
                collection_name=name,
                vectors_config=models.VectorParams(size=dim, distance=models.Distance.COSINE),
            )

    async def upsert(
        self, collection: str, ids: list[str | int], vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None:
        points = [
            models.PointStruct(id=pid, vector=vec, payload=pl)
            for pid, vec, pl in zip(ids, vectors, payloads, strict=True)
        ]
        await self._client.upsert(collection_name=collection, points=points)

    async def search(
        self, collection: str, vector: list[float], *, limit: int = 12,
        query_filter: models.Filter | None = None,
    ) -> list[dict[str, Any]]:
        res = await self._client.query_points(
            collection_name=collection, query=vector, limit=limit,
            query_filter=query_filter, with_payload=True,
        )
        return [{"id": p.id, "score": p.score, "payload": p.payload} for p in res.points]

    async def aclose(self) -> None:
        await self._client.close()
