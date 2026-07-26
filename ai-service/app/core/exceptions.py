"""Typed domain exceptions and their HTTP mapping.

Services raise semantic errors (``NotFoundError``, ``DependencyUnavailable``,
``NotImplementedYet``); the API layer never fabricates status codes. Handlers
render a consistent problem-detail JSON body.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger("app.error")


class AppError(Exception):
    """Base class for all expected, mapped errors."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str, *, details: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class BadRequestError(AppError):
    status_code = 400
    code = "bad_request"


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class DependencyUnavailable(AppError):
    """A downstream dependency (Qdrant, Redis, Mongo, LLM gateway) is unreachable."""

    status_code = 503
    code = "dependency_unavailable"


class NotImplementedYet(AppError):
    """Endpoint is defined in the API surface but its feature ships in a later phase."""

    status_code = 501
    code = "not_implemented"

    def __init__(self, feature: str, phase: str) -> None:
        super().__init__(
            f"{feature} is not implemented yet (planned for {phase}).",
            details={"feature": feature, "phase": phase},
        )


def _problem(status: int, code: str, message: str, details: dict) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "details": details}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        if exc.status_code >= 500:
            logger.error(exc.message, extra={"code": exc.code, **exc.details})
        return _problem(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(Exception)
    async def _handle_unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception")
        return _problem(500, "internal_error", "An unexpected error occurred.", {})
