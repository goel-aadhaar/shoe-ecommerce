"""Build a user x item interaction matrix from the behavioural event stream.

Each (user, item) cell is the summed, log-dampened event weight (view=1,
click=1.5, cart=3, purchase=5, ...). Log damping stops a few heavy users or
repeat views from dominating the collaborative signal.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class InteractionMatrix:
    matrix: Any                      # np.ndarray (n_users x n_items), float
    user_ids: list[str]
    item_ids: list[str]
    user_index: dict[str, int]
    item_index: dict[str, int]

    @property
    def n_users(self) -> int:
        return len(self.user_ids)

    @property
    def n_items(self) -> int:
        return len(self.item_ids)

    def user_vector(self, user_id: str):
        idx = self.user_index.get(user_id)
        return None if idx is None else self.matrix[idx]


def build_interaction_matrix(events: list[dict]) -> InteractionMatrix:
    """events: dicts with at least ``userId``, ``productId``, ``weight``."""
    import numpy as np

    user_index: dict[str, int] = {}
    item_index: dict[str, int] = {}
    agg: dict[tuple[int, int], float] = {}

    for e in events:
        u = str(e.get("userId") or "").strip()
        i = str(e.get("productId") or "").strip()
        if not u or not i:
            continue
        ui = user_index.setdefault(u, len(user_index))
        ii = item_index.setdefault(i, len(item_index))
        w = float(e.get("weight", 1.0) or 1.0)
        agg[(ui, ii)] = agg.get((ui, ii), 0.0) + w

    matrix = np.zeros((len(user_index), len(item_index)), dtype=np.float32)
    for (ui, ii), w in agg.items():
        matrix[ui, ii] = np.log1p(w)  # dampen heavy repeat interactions

    return InteractionMatrix(
        matrix=matrix,
        user_ids=list(user_index),
        item_ids=list(item_index),
        user_index=user_index,
        item_index=item_index,
    )
