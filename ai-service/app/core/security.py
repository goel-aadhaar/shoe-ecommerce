"""Service-to-service authentication.

The AI service is internal-only: the browser never calls it. Every request must
carry the shared ``X-Service-Token`` that the Express BFF holds. This is a
FastAPI dependency so it composes onto any router.

The authenticated *user* identity is not derived here — Express verifies the
JWT and forwards a trusted ``userId`` in the request body/params.
"""

from __future__ import annotations

import hmac

from fastapi import Header

from app.core.config import Settings, get_settings
from app.core.exceptions import UnauthorizedError


async def require_service_token(
    x_service_token: str | None = Header(default=None, alias="X-Service-Token"),
) -> None:
    settings: Settings = get_settings()
    expected = settings.service_token
    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise UnauthorizedError("Invalid or missing service token.")
