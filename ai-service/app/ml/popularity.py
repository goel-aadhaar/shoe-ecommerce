"""Popularity and trending via exponential time decay.

A purchase last week should count for more than one six months ago. Each event
contributes ``weight * 0.5 ** (age_days / half_life)``. Trending uses a short
window so it reacts to what's hot right now — the reliable cold-start floor and
a ranking signal in the hybrid blend.
"""

from __future__ import annotations

import datetime as dt


def _age_days(ts, now: dt.datetime) -> float:
    if ts is None:
        return 30.0
    if isinstance(ts, (int, float)):
        ts = dt.datetime.fromtimestamp(ts, dt.timezone.utc)
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=dt.timezone.utc)
    return max((now - ts).total_seconds() / 86400.0, 0.0)


def popularity_scores(
    events: list[dict], half_life_days: float = 14.0, now: dt.datetime | None = None
) -> dict[str, float]:
    now = now or dt.datetime.now(dt.timezone.utc)
    scores: dict[str, float] = {}
    for e in events:
        item = str(e.get("productId") or "").strip()
        if not item:
            continue
        weight = float(e.get("weight", 1.0) or 1.0)
        decay = 0.5 ** (_age_days(e.get("ts"), now) / half_life_days)
        scores[item] = scores.get(item, 0.0) + weight * decay
    return scores


def trending_scores(
    events: list[dict], window_days: int = 7, now: dt.datetime | None = None
) -> dict[str, float]:
    now = now or dt.datetime.now(dt.timezone.utc)
    recent = [e for e in events if _age_days(e.get("ts"), now) <= window_days]
    # Emphasise cart/purchase within the window (weights already encode intent).
    return popularity_scores(recent, half_life_days=max(window_days / 2, 1), now=now)


def normalize(scores: dict[str, float]) -> dict[str, float]:
    if not scores:
        return {}
    hi = max(scores.values()) or 1.0
    return {k: v / hi for k, v in scores.items()}
