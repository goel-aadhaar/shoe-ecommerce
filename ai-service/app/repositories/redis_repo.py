"""Redis access (async) — cache and conversation/session memory."""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger("app.redis")


class RedisRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._redis = aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )

    async def ping(self) -> bool:
        return bool(await self._redis.ping())

    # --- generic JSON cache ---
    async def get_json(self, key: str) -> Any | None:
        raw = await self._redis.get(key)
        return json.loads(raw) if raw else None

    async def set_json(self, key: str, value: Any, ttl: int | None = None) -> None:
        await self._redis.set(key, json.dumps(value, default=str), ex=ttl)

    async def delete(self, *keys: str) -> None:
        if keys:
            await self._redis.delete(*keys)

    # --- conversation memory ---
    async def get_session(self, session_id: str) -> dict | None:
        return await self.get_json(f"chat:session:{session_id}")

    async def save_session(self, session_id: str, data: dict) -> None:
        await self.set_json(
            f"chat:session:{session_id}", data, ttl=self._settings.session_ttl_seconds
        )

    async def aclose(self) -> None:
        await self._redis.aclose()
