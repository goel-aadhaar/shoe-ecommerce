"""Analytics aggregation pipelines.

Pure MongoDB aggregation-pipeline builders, kept separate from the service so
they're unit-testable and reviewable on their own. Everything is derived from
the ``events`` stream that the storefront writes via ``POST /v1/events``.
"""

from __future__ import annotations

import datetime as dt

# Event weights mirror AnalyticsService._WEIGHTS; the funnel treats these as
# ordered stages of intent.
FUNNEL_STAGES = ["view", "click", "add_to_cart", "purchase"]


def _since(days: int) -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)


def funnel_pipeline(days: int = 30) -> list[dict]:
    """Count distinct events per funnel stage over the window."""
    return [
        {"$match": {"ts": {"$gte": _since(days)}, "type": {"$in": FUNNEL_STAGES}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$project": {"_id": 0, "stage": "$_id", "count": 1}},
    ]


def top_products_pipeline(days: int = 30, limit: int = 10) -> list[dict]:
    """Most-engaged products, weighted by intent (purchase >> view).

    Groups on the *stringified* productId: the seeder writes raw ObjectIds while
    the live ingestion endpoint writes strings, and grouping on the raw value
    would split one product into two rows that each under-count.
    """
    return [
        {"$match": {"ts": {"$gte": _since(days)}, "productId": {"$ne": None}}},
        {"$group": {
            "_id": {"$toString": "$productId"},
            "score": {"$sum": "$weight"},
            "views": {"$sum": {"$cond": [{"$eq": ["$type", "view"]}, 1, 0]}},
            "carts": {"$sum": {"$cond": [{"$eq": ["$type", "add_to_cart"]}, 1, 0]}},
            "purchases": {"$sum": {"$cond": [{"$eq": ["$type", "purchase"]}, 1, 0]}},
        }},
        {"$sort": {"score": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "productId": "$_id", "score": 1,
                      "views": 1, "carts": 1, "purchases": 1}},
    ]


def daily_series_pipeline(days: int = 30) -> list[dict]:
    """Per-day event counts split by type — powers the dashboard time series."""
    return [
        {"$match": {"ts": {"$gte": _since(days)}}},
        {"$group": {
            "_id": {
                "day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$ts"}},
                "type": "$type",
            },
            "count": {"$sum": 1},
        }},
        {"$group": {
            "_id": "$_id.day",
            "counts": {"$push": {"type": "$_id.type", "count": "$count"}},
            "total": {"$sum": "$count"},
        }},
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "day": "$_id", "counts": 1, "total": 1}},
    ]


def top_searches_pipeline(days: int = 30, limit: int = 10) -> list[dict]:
    """Most frequent search queries — 'search behaviour' on the dashboard."""
    return [
        {"$match": {"ts": {"$gte": _since(days)}, "type": "search",
                    "query": {"$nin": [None, ""]}}},
        {"$group": {"_id": {"$toLower": "$query"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "query": "$_id", "count": 1}},
    ]


def engagement_pipeline(days: int = 30) -> list[dict]:
    """Unique users and sessions active in the window."""
    return [
        {"$match": {"ts": {"$gte": _since(days)}}},
        {"$group": {
            # Stringify for the same reason as top_products: seeded events hold
            # ObjectIds, live events hold strings, and the raw values would
            # double-count one user as two.
            "_id": None,
            "users": {"$addToSet": {"$toString": "$userId"}},
            "sessions": {"$addToSet": "$sessionId"},
            "events": {"$sum": 1},
        }},
        {"$project": {
            "_id": 0,
            "events": 1,
            "uniqueUsers": {"$size": {"$filter": {
                "input": "$users", "as": "u", "cond": {"$ne": ["$$u", None]}}}},
            "uniqueSessions": {"$size": {"$filter": {
                "input": "$sessions", "as": "s", "cond": {"$ne": ["$$s", None]}}}},
        }},
    ]


def compute_rates(funnel: dict[str, int]) -> dict[str, float]:
    """Derive CTR / cart-rate / conversion from raw funnel counts.

    CTR         = clicks / views
    cart rate   = add_to_cart / views
    conversion  = purchases / views
    """
    views = funnel.get("view", 0)
    if not views:
        return {"ctr": 0.0, "cartRate": 0.0, "conversionRate": 0.0}
    return {
        "ctr": round(funnel.get("click", 0) / views, 4),
        "cartRate": round(funnel.get("add_to_cart", 0) / views, 4),
        "conversionRate": round(funnel.get("purchase", 0) / views, 4),
    }
