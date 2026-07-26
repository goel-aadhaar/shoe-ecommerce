"""Hybrid ranking — blend heterogeneous signals into one score.

    score(u,i) = w_cf·cf + w_content·content + w_pop·popularity
               + w_trend·trending + w_affinity·affinity
    then business boosts (in-stock) and demotions (already purchased).

Weights start hand-tuned; the same interface accepts learned weights (logistic
LTR on click/purchase labels) once event volume supports it.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Weights:
    cf: float = 0.40
    content: float = 0.20
    popularity: float = 0.20
    trending: float = 0.10
    affinity: float = 0.10


def blend(
    candidates: set[str],
    *,
    cf: dict[str, float] | None = None,
    content: dict[str, float] | None = None,
    popularity: dict[str, float] | None = None,
    trending: dict[str, float] | None = None,
    affinity: dict[str, float] | None = None,
    weights: Weights = Weights(),
    in_stock: set[str] | None = None,
    exclude: set[str] | None = None,
) -> list[tuple[str, float]]:
    cf, content = cf or {}, content or {}
    popularity, trending, affinity = popularity or {}, trending or {}, affinity or {}
    exclude = exclude or set()

    scored: list[tuple[str, float]] = []
    for item in candidates:
        if item in exclude:
            continue
        s = (
            weights.cf * cf.get(item, 0.0)
            + weights.content * content.get(item, 0.0)
            + weights.popularity * popularity.get(item, 0.0)
            + weights.trending * trending.get(item, 0.0)
            + weights.affinity * affinity.get(item, 0.0)
        )
        if in_stock is not None and item not in in_stock:
            s *= 0.4  # demote out-of-stock rather than hide (still discoverable)
        scored.append((item, s))
    scored.sort(key=lambda kv: kv[1], reverse=True)
    return scored
