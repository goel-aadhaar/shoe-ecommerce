"""Test fixtures.

Environment is configured for hermetic tests before the app is imported: the
``hash`` embedder (no torch download) and a known service token. External
dependencies (Mongo/Qdrant/Redis) are not required — they connect lazily and
readiness simply reports them down.
"""

from __future__ import annotations

import os

os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("EMBEDDINGS_PROVIDER", "hash")
os.environ.setdefault("SERVICE_TOKEN", "test-token")
os.environ.setdefault("LLM_GATEWAY_API_KEY", "test-key")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402


@pytest.fixture(scope="session")
def client():
    get_settings.cache_clear()
    from app.main import create_app

    app = create_app()
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers():
    return {"X-Service-Token": "test-token"}
