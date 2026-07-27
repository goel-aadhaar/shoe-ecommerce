"""Pluggable embedding provider.

The LLM gateway exposes no embeddings endpoint, so the default provider is a
local SentenceTransformers model. The abstraction keeps that swappable:

* ``sbert``  — local SentenceTransformers (production default)
* ``hash``   — deterministic pseudo-vectors, no torch; for dev/tests/CI
* ``gateway``— reserved, if an embeddings-capable endpoint appears later

``sentence-transformers`` (and torch) are imported lazily so the core service
and the test suite stay importable without the heavy ML stack installed.
"""

from __future__ import annotations

import hashlib
from typing import Protocol

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger("app.embeddings")


class Embedder(Protocol):
    dim: int

    def embed(self, texts: list[str]) -> list[list[float]]: ...

    def embed_one(self, text: str) -> list[float]: ...


class _BaseEmbedder:
    dim: int

    def embed_one(self, text: str) -> list[float]:
        return self.embed([text])[0]


class HashEmbedder(_BaseEmbedder):
    """Deterministic bag-of-words hashing embedder. Zero heavy deps.

    Not semantically strong — a stand-in that lets the whole pipeline run in
    tests/CI and local dev without downloading a transformer.
    """

    def __init__(self, dim: int = 384) -> None:
        self.dim = dim

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for text in texts:
            vec = [0.0] * self.dim
            for token in text.lower().split():
                h = int(hashlib.md5(token.encode()).hexdigest(), 16)
                vec[h % self.dim] += 1.0
            norm = sum(v * v for v in vec) ** 0.5 or 1.0
            vectors.append([v / norm for v in vec])
        return vectors


class SbertEmbedder(_BaseEmbedder):
    """Local SentenceTransformers embedder (lazy-loaded)."""

    def __init__(self, model_name: str, dim: int) -> None:
        self.model_name = model_name
        self.dim = dim
        self._model = None  # loaded on first use

    def _ensure(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer  # heavy import, lazy

            logger.info("loading_embedding_model", extra={"model": self.model_name})
            self._model = SentenceTransformer(self.model_name)
            self.dim = self._model.get_sentence_embedding_dimension()
        return self._model

    def embed(self, texts: list[str]) -> list[list[float]]:
        model = self._ensure()
        arr = model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
        return arr.tolist()


class RemoteEmbedder(_BaseEmbedder):
    """Embeddings over an OpenAI-compatible ``/embeddings`` HTTP endpoint.

    Exists so the service can run without torch. That matters on hosts with a
    hard image-size cap — the local stack (torch, transformers, scipy) measures
    ~870 MB installed, which exceeds Heroku's 500 MB slug limit outright, and it
    is also the single largest memory consumer on a small VM.

    Works with any provider exposing the OpenAI embeddings shape (OpenAI, Jina,
    Together, a local TEI server, ...).
    """

    def __init__(self, base_url: str, api_key: str, model: str, dim: int, timeout: int = 30) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.dim = dim
        self._timeout = timeout

    def embed(self, texts: list[str]) -> list[list[float]]:
        import httpx  # already a core dependency

        try:
            resp = httpx.post(
                f"{self.base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={"model": self.model, "input": texts},
                timeout=self._timeout,
            )
            resp.raise_for_status()
            payload = resp.json()
        except Exception as exc:  # noqa: BLE001
            # Never take the whole request down over embeddings; degrade to the
            # deterministic embedder so search returns something rather than 500.
            logger.error("remote_embeddings_failed", extra={"err": str(exc)})
            return HashEmbedder(dim=self.dim).embed(texts)

        rows = sorted(payload.get("data", []), key=lambda d: d.get("index", 0))
        vectors = [r["embedding"] for r in rows]
        if vectors:
            self.dim = len(vectors[0])
        return vectors


def build_embedder(settings: Settings) -> Embedder:
    provider = settings.embeddings_provider
    if provider == "hash":
        return HashEmbedder(dim=settings.embeddings_dim)
    if provider == "sbert":
        return SbertEmbedder(model_name=settings.embeddings_model, dim=settings.embeddings_dim)
    if provider == "remote":
        base = settings.embeddings_base_url or settings.llm_gateway_base_url
        key = settings.embeddings_api_key or settings.llm_gateway_api_key
        if base and key:
            logger.info("using_remote_embeddings", extra={"model": settings.embeddings_model})
            return RemoteEmbedder(
                base_url=base, api_key=key,
                model=settings.embeddings_model, dim=settings.embeddings_dim,
            )
        logger.warning("remote_embeddings_unconfigured_fallback_hash")
        return HashEmbedder(dim=settings.embeddings_dim)

    logger.warning("embeddings_provider_unavailable_fallback_hash", extra={"provider": provider})
    return HashEmbedder(dim=settings.embeddings_dim)
