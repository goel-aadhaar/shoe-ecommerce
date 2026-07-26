"""SearchService wiring test — embed -> Qdrant filtered ANN -> hydrate.

Uses in-memory fakes for the vector store and catalog so the ranking/hydration
contract is verified deterministically without Mongo or Qdrant running.
"""

from __future__ import annotations

import pytest

from app.core.config import Settings
from app.services.search_service import SearchService
from app.schemas.search import SearchFilters, SemanticSearchRequest


class FakeEmbedder:
    dim = 8

    def embed(self, texts):
        return [[0.1] * self.dim for _ in texts]

    def embed_one(self, text):
        return [0.1] * self.dim


class FakeQdrant:
    products = "products"

    def __init__(self, hits):
        self._hits = hits
        self.captured = None

    async def search(self, collection, vector, *, limit=12, query_filter=None):
        self.captured = {"collection": collection, "limit": limit, "filter": query_filter}
        return self._hits[:limit]


class FakeCatalog:
    def __init__(self, products):
        self._p = {p["id"]: p for p in products}

    async def get_products(self, ids):
        return [self._p[i] for i in ids if i in self._p]

    async def get_product(self, pid):
        return self._p.get(pid)


def _product(pid, name, price):
    return {"id": pid, "name": name, "brand": "Nike", "price": price, "gender": "Male",
            "color": "black", "thumbnail": None, "rating": 4.2, "category": "shoes"}


def _service(hits, products):
    return SearchService(FakeEmbedder(), FakeQdrant(hits), FakeCatalog(products),
                         Settings(_env_file=None))


@pytest.mark.asyncio
async def test_semantic_search_preserves_ranking_and_hydrates():
    hits = [
        {"id": "uuid-1", "score": 0.91, "payload": {"productId": "p1"}},
        {"id": "uuid-2", "score": 0.77, "payload": {"productId": "p2"}},
    ]
    products = [_product("p1", "Office Comfort Oxford", 4999),
                _product("p2", "Daily Walk Sneaker", 3499)]
    svc = _service(hits, products)

    resp = await svc.semantic_search(
        SemanticSearchRequest(query="comfortable office shoes", limit=5)
    )

    assert resp.count == 2
    assert [r.id for r in resp.results] == ["p1", "p2"]      # ranking preserved
    assert resp.results[0].score == 0.91
    assert resp.results[0].name == "Office Comfort Oxford"


@pytest.mark.asyncio
async def test_semantic_search_skips_missing_products():
    hits = [
        {"id": "u1", "score": 0.9, "payload": {"productId": "p1"}},
        {"id": "u2", "score": 0.8, "payload": {"productId": "ghost"}},  # not in catalog
    ]
    svc = _service(hits, [_product("p1", "Runner", 2999)])
    resp = await svc.semantic_search(SemanticSearchRequest(query="running", limit=5))
    assert [r.id for r in resp.results] == ["p1"]


@pytest.mark.asyncio
async def test_filters_are_forwarded_to_qdrant():
    svc = _service([], [])
    await svc.semantic_search(
        SemanticSearchRequest(
            query="black sneakers",
            filters=SearchFilters(colour="Black", gender="Male", maxPrice=4000),
            limit=8,
        )
    )
    captured = svc._qdrant.captured
    assert captured["limit"] == 8
    assert captured["filter"] is not None  # a Qdrant Filter was built from the filters
