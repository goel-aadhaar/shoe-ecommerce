"""Catalog -> Qdrant indexer.

Builds a canonical text per product, embeds it, and upserts the vector +
filterable payload into the Qdrant ``products`` collection. Shared by the
Celery task and the ``scripts/index_catalog.py`` CLI.

Qdrant point ids must be uint64 or UUID; Mongo ``_id`` is a 24-hex ObjectId, so
we derive a stable UUID from it and keep the real id in the payload.
"""

from __future__ import annotations

import re
import uuid

from app.core.container import Container, build_container
from app.core.logging import get_logger
from app.repositories.catalog_repo import build_embedding_text, product_rating

logger = get_logger("app.indexer")

_NAMESPACE = uuid.UUID("6f2a1c00-0000-4000-8000-000000000001")
_KB_NAMESPACE = uuid.UUID("6f2a1c00-0000-4000-8000-000000000002")


def point_id(product_id: str) -> str:
    return str(uuid.uuid5(_NAMESPACE, product_id))


def kb_point_id(source: str, title: str, body: str) -> str:
    """Stable UUID for a knowledge-base chunk.

    Includes the full body, not a prefix: two products sharing a name (the real
    catalog has several "AIR MAX 90") would otherwise collide and overwrite
    each other's chunks.
    """
    return str(uuid.uuid5(_KB_NAMESPACE, f"{source}|{title}|{body}"))


def _colour_tokens(doc: dict) -> list[str]:
    """Searchable colour tokens.

    The catalog's populated field is the singular ``color`` (often a compound
    colourway like "SAIL/BURGUNDY CRUSH-BLACK"); the plural ``colors`` array is
    usually empty. Index both, split into individual words, so a filter for
    "black" matches a product whose colourway merely contains black.
    """
    raw: list[str] = [c for c in (doc.get("colors") or []) if isinstance(c, str)]
    if isinstance(doc.get("color"), str):
        raw.append(doc["color"])

    tokens: set[str] = set()
    for value in raw:
        cleaned = value.lower()
        tokens.add(cleaned)
        for part in re.split(r"[^a-z0-9]+", cleaned):
            if len(part) > 2:
                tokens.add(part)
    return sorted(tokens)


def _payload(doc: dict, category_names: dict[str, str] | None = None) -> dict:
    category_id = str(doc["category"]) if doc.get("category") else None
    return {
        "productId": str(doc.get("_id")),
        "name": doc.get("name"),
        "brand": doc.get("brand"),
        # Keep the id for joins, and the human-readable name for filtering —
        # callers (and the copilot) supply a name like "sneakers", never an id.
        "categoryId": category_id,
        "category": ((category_names or {}).get(category_id) or "").lower() or None,
        "gender": doc.get("for"),
        "price": doc.get("price"),
        "colors": _colour_tokens(doc),
        "rating": product_rating(doc),
        "inStock": (doc.get("stock", 0) or 0) > 0,
        "thumbnail": doc.get("thumbnail"),
    }


async def reindex_catalog(container: Container | None = None, batch_size: int = 128) -> dict:
    owns = container is None
    container = container or build_container()
    try:
        embedder = container.embedder
        qdrant = container.qdrant
        collection = qdrant.products

        dim = len(embedder.embed_one("dimension probe"))
        await qdrant.ensure_collection(collection, dim)

        # Category names, so the payload can be filtered by the word a shopper
        # (or the copilot) actually says rather than by an ObjectId.
        category_names: dict[str, str] = {}
        async for cat in container.mongo.db["categories"].find({}, {"name": 1}):
            if cat.get("name"):
                category_names[str(cat["_id"])] = str(cat["name"])
        logger.info("category_names_loaded", extra={"count": len(category_names)})

        total = 0
        batch_docs: list[dict] = []

        async def flush(docs: list[dict]) -> int:
            if not docs:
                return 0
            texts = [build_embedding_text(d) for d in docs]
            vectors = embedder.embed(texts)
            ids = [point_id(str(d["_id"])) for d in docs]
            payloads = [_payload(d, category_names) for d in docs]
            await qdrant.upsert(collection, ids, vectors, payloads)
            return len(docs)

        async for doc in container.catalog.iter_all_products(batch_size=batch_size):
            batch_docs.append(doc)
            if len(batch_docs) >= batch_size:
                total += await flush(batch_docs)
                batch_docs = []
        total += await flush(batch_docs)

        logger.info("reindex_complete", extra={"indexed": total, "dim": dim})
        return {"indexed": total, "dim": dim, "collection": collection}
    finally:
        if owns:
            await container.shutdown()
