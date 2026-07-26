"""Enrich product documents so semantic search has something to match on.

The imported catalog carries an empty ``tags`` array and a ~100-character
description, which is thin for embedding: a query like "cushioned shoes for long
walks" has almost no surface to match against, and colour/material filters have
nothing to filter on.

This derives structured attributes from the fields that DO exist (name, brand,
category, colourway, price band) using explicit rules — no model calls, so it is
deterministic and re-runnable — then rewrites the description into a richer
sentence set that mentions use case, material and fit.

    python -m scripts.enrich_catalog            # apply
    python -m scripts.enrich_catalog --dry-run  # preview only
"""

from __future__ import annotations

import argparse
import re

from pymongo import MongoClient

from app.core.config import get_settings

# name/brand keyword -> (use cases, tags)
USE_CASE_RULES: list[tuple[re.Pattern, list[str], list[str]]] = [
    (re.compile(r"structure|pegasus|vomero|invincible|running|run\b", re.I),
     ["running", "training", "long walks"],
     ["cushioned", "supportive", "breathable", "everyday-training"]),
    (re.compile(r"trainer|omni|metcon|gym", re.I),
     ["gym", "cross-training", "everyday"],
     ["stable", "durable", "grippy", "versatile"]),
    (re.compile(r"air max|air force|dunk|jordan|samba|gazelle|superstar|campus", re.I),
     ["casual", "streetwear", "everyday"],
     ["iconic", "classic", "street-style", "all-day-comfort"]),
    (re.compile(r"clog|croc", re.I),
     ["casual", "indoor", "slip-on", "rainy weather"],
     ["lightweight", "waterproof", "easy-on", "cushioned"]),
    (re.compile(r"slip pro|one star|chuck|converse|vans", re.I),
     ["skate", "casual", "streetwear"],
     ["flat-sole", "canvas", "board-feel", "durable"]),
    (re.compile(r"vertebrae|sb\b|court|field general", re.I),
     ["skate", "casual", "outdoor"],
     ["rugged", "grippy", "reinforced"]),
    (re.compile(r"\b550|574|327|1000|9060|2002", re.I),
     ["casual", "everyday", "walking"],
     ["retro", "cushioned", "suede", "comfortable"]),
]

MATERIAL_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"leather", re.I), "leather"),
    (re.compile(r"suede", re.I), "suede"),
    (re.compile(r"canvas|chuck|one star", re.I), "canvas"),
    (re.compile(r"knit|flyknit|primeknit|sock", re.I), "knit"),
    (re.compile(r"croc|clog", re.I), "croslite foam"),
    (re.compile(r"mesh|breathable|running|structure|pegasus", re.I), "engineered mesh"),
]

COLOUR_WORDS = [
    "black", "white", "cream", "sail", "grey", "gray", "navy", "blue", "red",
    "green", "brown", "beige", "pink", "orange", "burgundy", "silver", "gold",
    "purple", "yellow", "olive", "tan", "maroon", "ivory",
]


def price_band(price: float | None) -> str:
    if not price:
        return "mid-range"
    if price < 4000:
        return "budget-friendly"
    if price < 8000:
        return "mid-range"
    if price < 13000:
        return "premium"
    return "flagship"


def derive(doc: dict) -> dict:
    name = doc.get("name") or ""
    brand = doc.get("brand") or ""
    haystack = f"{name} {brand} {doc.get('description', '')}"

    use_cases: list[str] = []
    tags: list[str] = []
    for pattern, uses, tg in USE_CASE_RULES:
        if pattern.search(haystack):
            use_cases += [u for u in uses if u not in use_cases]
            tags += [t for t in tg if t not in tags]
    if not use_cases:
        use_cases = ["casual", "everyday"]
        tags = ["versatile", "everyday-wear"]

    material = next((m for pattern, m in MATERIAL_RULES if pattern.search(haystack)), "synthetic")

    colourway = (doc.get("color") or " ".join(doc.get("colors") or []) or "").lower()
    colours = sorted({c for c in COLOUR_WORDS if c in colourway})
    if not colours:
        colours = ["multi"]

    gender = (doc.get("for") or "").lower()
    audience = "women" if gender == "female" else "men" if gender == "male" else "everyone"
    band = price_band(doc.get("price"))

    tags = sorted(set(tags + colours + [material.replace(" ", "-"), band, brand.lower()]))

    # A description with real searchable surface: what it is, who it suits, what
    # it is made of, and what it is good for.
    description = (
        f"{name} by {brand}. A {band} {material} shoe for {audience}, "
        f"in {', '.join(colours)}. Well suited to {', '.join(use_cases)}. "
        f"{'Cushioned and supportive for long hours on your feet. ' if 'cushioned' in tags else ''}"
        f"{'Lightweight and easy to slip on. ' if 'easy-on' in tags else ''}"
        f"Available in sizes {', '.join(map(str, doc.get('sizes') or [])) or 'standard UK sizing'}."
    ).strip()

    return {
        "tags": tags,
        "useCase": use_cases,
        "material": material,
        "priceBand": band,
        "description": description,
    }


def main() -> None:
    settings = get_settings()
    ap = argparse.ArgumentParser(description="Enrich catalog metadata for semantic search.")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--mongo-uri", default=settings.mongo_uri)
    ap.add_argument("--db", default=settings.mongo_db)
    args = ap.parse_args()

    db = MongoClient(args.mongo_uri)[args.db]
    products = list(db["products"].find({}))
    print(f"catalog: {len(products)} products\n")

    updated = 0
    for p in products:
        fields = derive(p)
        if args.dry_run:
            if updated < 3:
                print(f"{p.get('name')}")
                print(f"   material : {fields['material']}")
                print(f"   useCase  : {fields['useCase']}")
                print(f"   tags     : {fields['tags'][:8]}")
                print(f"   desc     : {fields['description'][:150]}\n")
        else:
            db["products"].update_one({"_id": p["_id"]}, {"$set": fields})
        updated += 1

    verb = "would update" if args.dry_run else "updated"
    print(f"{verb} {updated} products")
    if not args.dry_run:
        print("\nRe-index so the new text reaches Qdrant:")
        print("  python -m scripts.index_catalog")
        print("  python -m scripts.ingest_knowledge")


if __name__ == "__main__":
    main()
