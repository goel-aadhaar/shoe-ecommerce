"""Tests for the KB chunker and RAG service wiring."""

from __future__ import annotations

import json

import pytest

pytest.importorskip("numpy")

from app.core.config import Settings
from app.llm.client import ChatResult
from app.rag import build_all_chunks, build_global_chunks, build_product_chunks
from app.schemas.content import AskRequest


class FakeEmbedder:
    dim = 8

    def embed(self, texts):
        return [[0.0] * self.dim for _ in texts]

    def embed_one(self, text):
        return [0.0] * self.dim


class FakeQdrant:
    knowledge = "knowledge"
    last = None

    def __init__(self, hits):
        self._hits = hits

    async def search(self, collection, vector, *, limit=12, query_filter=None):
        FakeQdrant.last = {"collection": collection, "filter": query_filter, "limit": limit}
        return self._hits[:limit]


class FakeRedis:
    def __init__(self):
        self.store = {}

    async def get_json(self, key):
        return self.store.get(key)

    async def set_json(self, key, value, ttl=None):
        self.store[key] = value


class FakeLLM:
    def __init__(self, answer_text="Yes, returns within 30 days.", citations=(1,)):
        self._text = answer_text
        self._cites = list(citations)

    async def chat(self, messages, *, tools=None, tool_choice=None, temperature=None,
                   max_tokens=None, response_format=None, highspeed=False):
        return ChatResult(
            content="",
            tool_calls=[{
                "id": "a1", "type": "function",
                "function": {"name": "answer",
                             "arguments": json.dumps({"answer": self._text,
                                                      "citations": self._cites})},
            }],
            finish_reason="stop", usage={},
            raw={"choices": [{"message": {"content": "", "tool_calls": [
                {"id": "a1", "type": "function",
                 "function": {"name": "answer",
                              "arguments": json.dumps({"answer": self._text,
                                                       "citations": self._cites})}}
            ]}}]},
        )


def test_global_chunks_present():
    chunks = build_global_chunks()
    titles = {c.title for c in chunks}
    assert "Return Policy" in titles
    assert "Shipping Policy" in titles
    assert "Shoe Care Guide" in titles


def test_generate_product_chunks_includes_sizing_and_use():
    product = {
        "_id": "p1", "name": "Speed Runner", "brand": "Nike", "price": 4999,
        "for": "Male", "color": "Black", "sizes": [8, 9, 10], "rating": 4.5,
        "ratedBy": 120, "attributes": ["trending"], "description": "A great running shoe.",
    }
    chunks = build_product_chunks(product)
    assert any("sizing" in c.title.lower() for c in chunks)
    assert any(c.source == "product" and c.product_id == "p1" for c in chunks)


def test_build_all_chunks_combines_globals_and_products():
    chunks = build_all_chunks([
        {"_id": "a", "name": "A", "brand": "X", "price": 100, "for": "Male",
         "color": "red", "sizes": [], "rating": 4, "ratedBy": 10, "attributes": [],
         "description": "d"},
        {"_id": "b", "name": "B", "brand": "Y", "price": 200, "for": "Female",
         "color": "blue", "sizes": [], "rating": 4, "ratedBy": 10, "attributes": [],
         "description": "d"},
    ])
    assert sum(1 for c in chunks if c.source == "product") >= 6
    assert any(c.source == "policy" for c in chunks)


@pytest.mark.asyncio
async def test_rag_returns_grounded_answer_with_citations():
    from app.services.rag_service import RagService

    redis = FakeRedis()
    llm = FakeLLM(answer_text="Yes, returns within 30 days for unworn shoes.", citations=[1])
    qdrant = FakeQdrant([{
        "id": "k1", "score": 0.95,
        "payload": {"source": "policy", "title": "Return Policy",
                    "body": "We accept returns within 30 days of delivery for unworn shoes.",
                    "productId": None},
    }])
    svc = RagService(FakeEmbedder(), qdrant, llm, redis, Settings(_env_file=None))

    resp = await svc.ask(AskRequest(question="What is your return policy?"))

    assert resp.grounded
    assert "30 days" in resp.answer
    assert resp.citations[0].source == "policy"
    assert resp.citations[0].title == "Return Policy"


@pytest.mark.asyncio
async def test_rag_refuses_when_citations_empty():
    from app.services.rag_service import RagService

    redis = FakeRedis()
    llm = FakeLLM(answer_text="I don't have that information.", citations=[])
    qdrant = FakeQdrant([{
        "id": "k1", "score": 0.5,
        "payload": {"source": "policy", "title": "Shipping Policy",
                    "body": "Standard delivery 3-5 business days.", "productId": None},
    }])
    svc = RagService(FakeEmbedder(), qdrant, llm, redis, Settings(_env_file=None))

    resp = await svc.ask(AskRequest(question="What's your favorite color?"))
    assert not resp.grounded
    assert resp.citations == []
