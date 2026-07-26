"""ML engine tests — deterministic, on synthetic interactions.

Verifies the algorithms directly (no Mongo/Qdrant): interaction matrix, item-item
CF, association rules, popularity decay, hybrid ranking, and artifact round-trip.
Requires the ML deps (numpy/pandas/scikit-learn/mlxtend).
"""

from __future__ import annotations

import datetime as dt

import pytest

pytest.importorskip("numpy")
pytest.importorskip("sklearn")

from app.ml.artifacts import ArtifactStore, RecModel  # noqa: E402
from app.ml.association import mine_association_rules  # noqa: E402
from app.ml.collaborative import ItemCF  # noqa: E402
from app.ml.interactions import build_interaction_matrix  # noqa: E402
from app.ml.popularity import popularity_scores  # noqa: E402
from app.ml.ranking import blend  # noqa: E402


def test_interaction_matrix_shape():
    events = [
        {"userId": "u1", "productId": "p1", "weight": 5},
        {"userId": "u1", "productId": "p2", "weight": 1},
        {"userId": "u2", "productId": "p1", "weight": 3},
    ]
    im = build_interaction_matrix(events)
    assert im.n_users == 2 and im.n_items == 2
    assert im.user_vector("u1") is not None
    assert im.user_vector("ghost") is None


def test_item_cf_learns_cooccurrence():
    events = []
    for u in range(12):  # everyone who likes p1 also likes p2
        events += [
            {"userId": f"u{u}", "productId": "p1", "weight": 5},
            {"userId": f"u{u}", "productId": "p2", "weight": 5},
        ]
    for u in range(12, 18):  # a separate cluster likes p3
        events.append({"userId": f"u{u}", "productId": "p3", "weight": 5})

    cf = ItemCF.train(build_interaction_matrix(events), topk=10)

    neighbours = dict(cf.similar("p1", k=5))
    assert "p2" in neighbours and neighbours["p2"] > 0

    recommended = [i for i, _ in cf.recommend({"p1": 1.0}, k=3)]
    assert "p2" in recommended
    assert "p1" not in recommended  # already-seen excluded


def test_association_rules_frequently_bought_together():
    baskets = [["p1", "p2"]] * 10 + [["p3", "p4"]] * 5 + [["p1", "p5"]] * 2
    rules = mine_association_rules(baskets, min_support=0.05, min_lift=1.0)
    complements = dict(rules.complements(["p1"], k=5))
    assert "p2" in complements


def test_popularity_time_decay():
    now = dt.datetime.now(dt.timezone.utc)
    events = [
        {"productId": "fresh", "weight": 5, "ts": now},
        {"productId": "stale", "weight": 5, "ts": now - dt.timedelta(days=90)},
    ]
    scores = popularity_scores(events, half_life_days=14, now=now)
    assert scores["fresh"] > scores["stale"]


def test_ranking_demotes_out_of_stock():
    scored = dict(blend({"a", "b"}, cf={"a": 1.0, "b": 1.0}, in_stock={"a"}))
    assert scored["a"] > scored["b"]


def test_artifact_save_load_roundtrip(tmp_path):
    events = [
        {"userId": f"u{u}", "productId": pid, "weight": 5}
        for u in range(6)
        for pid in ("p1", "p2")
    ]
    cf = ItemCF.train(build_interaction_matrix(events), topk=5)
    rules = mine_association_rules([["p1", "p2"]] * 10, min_support=0.1)
    model = RecModel(
        version=RecModel.new_version(), item_cf=cf, rules=rules,
        popularity={"p1": 1.0}, trending={"p1": 1.0}, item_ids=["p1", "p2"],
    )
    ArtifactStore(str(tmp_path)).save(model)

    loaded = ArtifactStore(str(tmp_path)).load_latest()
    assert loaded is not None
    assert loaded.version == model.version
    assert dict(loaded.item_cf.similar("p1", k=3))  # neighbours survived pickling
