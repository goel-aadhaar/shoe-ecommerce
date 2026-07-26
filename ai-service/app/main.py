"""FastAPI application factory.

Boots the DI container in the lifespan, wires structured logging, a request-id
middleware, exception handlers, and the versioned API. Swagger UI at /docs.
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.router import build_v1_router
from app.core.config import get_settings
from app.core.container import build_container
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger, request_id_ctx

logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.log_level)
    logger.info("starting", extra={"env": settings.environment, "version": __version__})

    container = build_container(settings)
    await container.startup()
    app.state.container = container
    try:
        yield
    finally:
        await container.shutdown()
        logger.info("stopped")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="urban-sole AI service",
        version=__version__,
        description="Recommendations · semantic search · conversational copilot · RAG · analytics.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Internal service; CORS is permissive only in dev for the Swagger "try it out".
    if not settings.is_production:
        app.add_middleware(
            CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
        )

    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        rid = request.headers.get("X-Request-Id") or uuid.uuid4().hex[:12]
        token = request_id_ctx.set(rid)
        try:
            response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers["X-Request-Id"] = rid
        return response

    register_exception_handlers(app)
    app.include_router(build_v1_router(settings.api_v1_prefix))
    return app


app = create_app()
