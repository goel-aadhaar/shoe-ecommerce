"""Analytics tests: rate math, pipeline shapes, and summary assembly."""

from __future__ import annotations

import pytest

from app.analytics import (
    compute_rates,
    daily_series_pipeline,
    engagement_pipeline,
    funnel_pipeline,
    top_products_pipeline,
    top_searches_pipeline,
)
from app.core.config import Settings
from app.core.exceptions import BadRequestError
from app.services.analytics_service import AnalyticsService


def test_compute_rates_from_funnel():
    rates = compute_rates({"view": 1000, "click": 250, "add_to_cart": 100, "purchase": 40})
    assert rates["ctr"] == 0.25
    assert rates["cartRate"] == 0.1
    assert rates["conversionRate"] == 0.04


def test_compute_rates_handles_zero_views():
    rates = compute_rates({"purchase": 5})
    assert rates == {"ctr": 0.0, "cartRate": 0.0, "conversionRate": 0.0}


@pytest.mark.parametrize(
    "builder",
    [funnel_pipeline, top_products_pipeline, daily_series_pipeline,
     top_searches_pipeline, engagement_pipeline],
)
def test_pipelines_are_well_formed(builder):
    pipeline = builder()
    assert isinstance(pipeline, list) and pipeline
    # Every stage is a single-operator dict starting with '$'
    for stage in pipeline:
        assert isinstance(stage, dict) and len(stage) == 1
        assert next(iter(stage)).startswith("$")
    # All windowed pipelines filter by time first
    assert "$match" in pipeline[0]


def test_top_products_pipeline_respects_limit():
    pipeline = top_products_pipeline(days=7, limit=3)
    limits = [s["$limit"] for s in pipeline if "$limit" in s]
    assert limits == [3]


# --- summary assembly with a fake Mongo -------------------------------------
class FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    def __aiter__(self):
        async def gen():
            for r in self._rows:
                yield r
        return gen()


FUNNEL_ROWS = [
    {"stage": "view", "count": 100},
    {"stage": "click", "count": 20},
    {"stage": "purchase", "count": 5},
]
TOP_ROWS = [{"productId": "p1", "score": 42.0, "views": 30, "carts": 5, "purchases": 2}]
SEARCH_ROWS = [{"query": "white sneakers", "count": 7}]
ENGAGEMENT_ROWS = [{"events": 125, "uniqueUsers": 10, "uniqueSessions": 15}]
DAILY_ROWS = [{"day": "2026-07-25", "total": 40,
               "counts": [{"type": "view", "count": 35}, {"type": "purchase", "count": 5}]}]


def _classify(pipeline) -> str:
    """Identify which analytics pipeline this is, by its distinctive stage."""
    text = str(pipeline)
    if "uniqueUsers" in text:
        return "engagement"
    if "$toLower" in text:
        return "searches"
    if "$dateToString" in text:
        return "daily"
    if "purchases" in text:
        return "top"
    return "funnel"


class FakeCollection:
    def __init__(self, routes=None, count=0):
        self._routes = routes or {}
        self._count = count

    def aggregate(self, pipeline):
        return FakeCursor(self._routes.get(_classify(pipeline), []))

    async def count_documents(self, q):
        return self._count


class FakeChatSessions(FakeCollection):
    def aggregate(self, pipeline):
        return FakeCursor([{"_id": None, "total": 12}])


class FakeMongo:
    def __init__(self):
        self.events = FakeCollection({
            "funnel": FUNNEL_ROWS,
            "top": TOP_ROWS,
            "searches": SEARCH_ROWS,
            "engagement": ENGAGEMENT_ROWS,
            "daily": DAILY_ROWS,
        })
        self.chat_sessions = FakeChatSessions(count=3)
        self.analytics_rollups = FakeCollection()


class FakeCatalog:
    async def get_products(self, ids):
        return []


class FakeStore:
    def load_latest(self):
        return None


@pytest.mark.asyncio
async def test_summary_assembles_rates_and_sections():
    svc = AnalyticsService(FakeMongo(), FakeCatalog(), FakeStore(), Settings(_env_file=None))
    summary = await svc.summary(days=30)

    assert summary.windowDays == 30
    assert {f.stage for f in summary.funnel} == {"view", "click", "add_to_cart", "purchase"}
    # Funnel counts flowed into the derived rates
    assert summary.rates.ctr == 0.2          # 20 clicks / 100 views
    assert summary.rates.conversionRate == 0.05
    assert summary.copilot.sessions == 3
    assert summary.copilot.messages == 12

    # Other sections assembled from their own pipelines
    assert [t.productId for t in summary.topProducts] == ["p1"]
    assert summary.topSearches[0].query == "white sneakers"
    assert summary.engagement.uniqueUsers == 10
    assert summary.daily[0].counts == {"view": 35, "purchase": 5}


@pytest.mark.asyncio
async def test_get_metric_rejects_unknown_metric():
    svc = AnalyticsService(FakeMongo(), FakeCatalog(), FakeStore(), Settings(_env_file=None))
    with pytest.raises(BadRequestError):
        await svc.get_metric("not-a-metric")


@pytest.mark.asyncio
async def test_get_metric_accepts_known_metric():
    svc = AnalyticsService(FakeMongo(), FakeCatalog(), FakeStore(), Settings(_env_file=None))
    result = await svc.get_metric("funnel", days=7)
    assert result["metric"] == "funnel"
    assert result["windowDays"] == 7
