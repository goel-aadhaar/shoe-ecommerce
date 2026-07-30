"""Association-rule mining for bundles / frequently-bought-together.

FP-Growth (mlxtend) over order baskets, ranked by lift. FP-Growth scales past
Apriori on real basket volumes. When mlxtend is unavailable or the data is too
sparse for the support threshold, we fall back to raw co-occurrence counts so
the feature still returns something sensible.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class AssociationRules:
    # antecedent item_id -> list of (consequent item_id, score), sorted desc
    rules: dict[str, list[tuple[str, float]]] = field(default_factory=dict)
    method: str = "none"

    def complements(self, item_ids: list[str], k: int = 6) -> list[tuple[str, float]]:
        """Union complements for one or more anchor items (e.g. a cart)."""
        seed = set(item_ids)
        scores: dict[str, float] = {}
        for item in item_ids:
            for consequent, score in self.rules.get(item, []):
                if consequent in seed:
                    continue
                scores[consequent] = max(scores.get(consequent, 0.0), score)
        return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:k]


def _cooccurrence(baskets: list[list[str]], top_per_item: int) -> AssociationRules:
    pair: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for basket in baskets:
        uniq = list(set(basket))
        for a in uniq:
            for b in uniq:
                if a != b:
                    pair[a][b] += 1
    rules: dict[str, list[tuple[str, float]]] = {}
    for a, others in pair.items():
        ranked = sorted(others.items(), key=lambda kv: kv[1], reverse=True)[:top_per_item]
        mx = ranked[0][1] if ranked else 1
        rules[a] = [(b, c / mx) for b, c in ranked]
    return AssociationRules(rules=rules, method="cooccurrence")


def mine_association_rules(
    baskets: list[list[str]],
    min_support: float = 0.02,
    min_lift: float = 1.0,
    top_per_item: int = 10,
) -> AssociationRules:
    baskets = [b for b in baskets if len(b) >= 2]
    if len(baskets) < 5:
        return _cooccurrence(baskets, top_per_item)

    try:
        import pandas as pd
        from mlxtend.frequent_patterns import association_rules, fpgrowth
        from mlxtend.preprocessing import TransactionEncoder
    except ImportError:
        return _cooccurrence(baskets, top_per_item)

    te = TransactionEncoder()
    arr = te.fit(baskets).transform(baskets)
    df = pd.DataFrame(arr, columns=te.columns_)

    freq = fpgrowth(df, min_support=min_support, use_colnames=True)
    if freq.empty:
        return _cooccurrence(baskets, top_per_item)

    # mlxtend changed this signature between releases: 0.23.x requires
    # `num_itemsets` positionally, 0.25.x gives it a default. Detect rather than
    # pin, so the same code runs against whichever version is installed.
    import inspect

    kwargs: dict = {"metric": "lift", "min_threshold": min_lift}
    params = inspect.signature(association_rules).parameters
    if "num_itemsets" in params and params["num_itemsets"].default is inspect.Parameter.empty:
        kwargs["num_itemsets"] = len(baskets)

    rules_df = association_rules(freq, **kwargs)
    # Keep single-item antecedents for fast per-product lookup.
    rules_df = rules_df[rules_df["antecedents"].apply(len) == 1]
    if rules_df.empty:
        return _cooccurrence(baskets, top_per_item)

    grouped: dict[str, list[tuple[str, float]]] = defaultdict(list)
    for _, r in rules_df.iterrows():
        ant = next(iter(r["antecedents"]))
        for cons in r["consequents"]:
            grouped[ant].append((cons, float(r["lift"])))

    rules: dict[str, list[tuple[str, float]]] = {}
    for ant, pairs in grouped.items():
        pairs.sort(key=lambda kv: kv[1], reverse=True)
        rules[ant] = pairs[:top_per_item]
    return AssociationRules(rules=rules, method="fpgrowth")
