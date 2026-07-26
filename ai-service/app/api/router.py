"""Aggregate the v1 API surface.

Health probes are unauthenticated. Every feature router sits behind the
service-token dependency (the AI service is internal-only).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.v1 import analytics, chat, content, events, health, recommend, search
from app.core.security import require_service_token


def build_v1_router(prefix: str) -> APIRouter:
    root = APIRouter()

    # Unauthenticated probes (no prefix — orchestrators expect /health, /ready).
    root.include_router(health.router)

    protected = APIRouter(prefix=prefix, dependencies=[Depends(require_service_token)])
    for module in (search, recommend, chat, content, events, analytics):
        protected.include_router(module.router)

    root.include_router(protected)
    return root
