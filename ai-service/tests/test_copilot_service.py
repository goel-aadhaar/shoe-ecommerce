"""Copilot agent-loop test with a fake LLM.

Proves the tool-calling loop, tool execution against the (faked) catalog,
preference slot-filling, and Redis memory persistence — deterministically,
without calling the real gateway.
"""

from __future__ import annotations

import json

import pytest

from app.core.config import Settings
from app.llm.client import ChatResult
from app.schemas.chat import ChatRequest
from app.schemas.common import ScoredProduct
from app.schemas.search import SearchResponse
from app.services.copilot_service import CopilotService


def _result(content="", tool_calls=None):
    tcs = tool_calls or []
    return ChatResult(
        content=content, tool_calls=tcs, finish_reason="stop", usage={},
        raw={"choices": [{"message": {"content": content, "tool_calls": tcs}}]},
    )


class FakeLLM:
    def __init__(self):
        self.loop_calls = 0

    async def chat(self, messages, *, tools=None, tool_choice=None, temperature=None,
                   max_tokens=None, response_format=None, highspeed=False):
        names = [t["function"]["name"] for t in (tools or [])]
        # NL -> filters extraction call
        if names == ["set_filters"]:
            return _result(tool_calls=[{
                "id": "e1", "type": "function",
                "function": {"name": "set_filters",
                             "arguments": json.dumps({"size": "9", "maxPrice": 5000})},
            }])
        # Copilot loop: first turn calls a tool, second turn answers
        self.loop_calls += 1
        if self.loop_calls == 1:
            return _result(tool_calls=[{
                "id": "c1", "type": "function",
                "function": {"name": "search_products",
                             "arguments": json.dumps({"query": "white running shoes",
                                                      "colour": "white"})},
            }])
        return _result(content="Here are two white running shoes that fit your budget.")


class FakeSearch:
    def __init__(self):
        self.last_filters = None

    async def semantic_search(self, req):
        self.last_filters = req.filters
        return SearchResponse(
            query=req.query,
            results=[ScoredProduct(id="p1", name="White Runner", brand="Nike",
                                   price=3999, score=0.9, color="white")],
            count=1,
        )


class FakeContent:
    async def compare(self, req):
        from app.schemas.content import CompareResponse
        return CompareResponse(
            products=[], facets=[],
            recommendation="These shoes are similar in quality.",
        )


class FakeRecommender:
    async def recommend(self, req):  # not exercised here
        from app.schemas.recommend import RecommendResponse
        return RecommendResponse(section=req.section, items=[], modelVersion="test")


class FakeRedis:
    def __init__(self):
        self.store = {}

    async def get_session(self, sid):
        return self.store.get(sid)

    async def save_session(self, sid, data):
        self.store[sid] = data


@pytest.mark.asyncio
async def test_copilot_agent_loop_and_memory():
    redis = FakeRedis()
    search = FakeSearch()
    svc = CopilotService(FakeLLM(), search, FakeRecommender(), FakeContent(), redis, Settings(_env_file=None))

    resp = await svc.chat(ChatRequest(sessionId="s1", userId="u1",
                                      message="I usually wear size 9. Show white running shoes."))

    # Reply + grounded products from the tool call
    assert "white" in resp.reply.lower()
    assert [p.id for p in resp.products] == ["p1"]

    # Preference slot-filling persisted to memory
    session = redis.store["s1"]
    assert session["preferences"]["size"] == "9"
    assert session["preferences"]["maxPrice"] == 5000

    # Budget preference flowed into the search filters
    assert search.last_filters is not None
    assert search.last_filters.maxPrice == 5000

    # Conversation history persisted (user + assistant)
    roles = [m["role"] for m in session["messages"]]
    assert roles == ["user", "assistant"]
