"""Item-item collaborative filtering.

Item similarity = cosine similarity between item columns of the interaction
matrix (co-interaction pattern across users). We keep only the top-K neighbours
per item — that's what makes serving cheap and the artifact small.

Chosen over pure matrix factorization for the first cut because it's transparent
("customers who interacted with A also interacted with B"), trivially
incremental, and needs no training loop. LightFM/ALS remain a drop-in upgrade
behind the same ``recommend`` / ``similar`` interface.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.ml.interactions import InteractionMatrix


@dataclass
class ItemCF:
    item_ids: list[str]
    # item_id -> list of (neighbour_item_id, similarity), sorted desc, top-K
    neighbours: dict[str, list[tuple[str, float]]] = field(default_factory=dict)

    @classmethod
    def train(cls, im: InteractionMatrix, topk: int = 50) -> "ItemCF":
        import numpy as np
        from sklearn.metrics.pairwise import cosine_similarity

        if im.n_items == 0 or im.n_users == 0:
            return cls(item_ids=list(im.item_ids), neighbours={})

        sim = cosine_similarity(im.matrix.T)  # (items x items)
        np.fill_diagonal(sim, 0.0)

        neighbours: dict[str, list[tuple[str, float]]] = {}
        k = min(topk, im.n_items - 1) if im.n_items > 1 else 0
        for i, item_id in enumerate(im.item_ids):
            row = sim[i]
            if k > 0:
                top_idx = np.argpartition(row, -k)[-k:]
                top_idx = top_idx[np.argsort(row[top_idx])[::-1]]
            else:
                top_idx = []
            neighbours[item_id] = [
                (im.item_ids[j], float(row[j])) for j in top_idx if row[j] > 0
            ]
        return cls(item_ids=list(im.item_ids), neighbours=neighbours)

    def similar(self, item_id: str, k: int = 8) -> list[tuple[str, float]]:
        return self.neighbours.get(item_id, [])[:k]

    def recommend(
        self, interacted: dict[str, float], k: int = 12, exclude_seen: bool = True
    ) -> list[tuple[str, float]]:
        """Score candidate items by summing neighbour similarities weighted by
        how strongly the user interacted with the source item."""
        scores: dict[str, float] = {}
        for item_id, weight in interacted.items():
            for neighbour, sim in self.neighbours.get(item_id, []):
                if exclude_seen and neighbour in interacted:
                    continue
                scores[neighbour] = scores.get(neighbour, 0.0) + weight * sim
        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
        return ranked[:k]
