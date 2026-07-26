"""Liveness and readiness probes (unauthenticated)."""

from __future__ import annotations

from fastapi import APIRouter, Response

from app import __version__
from app.api.deps import ContainerDep
from app.schemas.common import HealthOut, ReadyOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
async def health() -> HealthOut:
    """Liveness: the process is up. Always cheap, never touches dependencies."""
    return HealthOut(version=__version__)


@router.get("/ready", response_model=ReadyOut)
async def ready(container: ContainerDep, response: Response) -> ReadyOut:
    """Readiness: can we serve traffic? Pings Mongo, Redis, Qdrant."""
    deps = await container.readiness()
    is_ready = all(deps.values())
    if not is_ready:
        response.status_code = 503
    return ReadyOut(ready=is_ready, dependencies=deps)
