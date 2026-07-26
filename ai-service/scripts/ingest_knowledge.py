"""CLI: ingest the knowledge base into Qdrant.

    python -m scripts.ingest_knowledge

Reads products from Mongo, derives KB chunks (per-product specs/fit/care + global
policy/FAQ docs), embeds them, and upserts them into the Qdrant ``knowledge``
collection with citation metadata. Run once after scripts/seed_interactions.py
and scripts/index_catalog.py.
"""

from __future__ import annotations

import asyncio

from app.core.config import get_settings
from app.core.container import build_container
from app.core.logging import configure_logging, get_logger
from app.rag import build_all_chunks
from app.workers.indexer import kb_point_id

logger = get_logger("scripts.ingest_knowledge")


async def main() -> None:
    configure_logging()
    s = get_settings()
    container = build_container(s)
    try:
        qdrant = container.qdrant
        embedder = container.embedder

        dim = len(embedder.embed_one("dimension probe"))
        await qdrant.ensure_collection(qdrant.knowledge, dim)

        products = [d async for d in container.catalog.iter_all_products()]
        chunks = build_all_chunks(products)
        logger.info("kb_chunks_built", extra={"count": len(chunks), "products": len(products)})

        if not chunks:
            print("No products found, nothing to ingest.")
            return

        texts = [c.body for c in chunks]
        vectors = embedder.embed(texts)
        ids = [kb_point_id(c.source, c.title, c.body) for c in chunks]
        payloads = [
            {"source": c.source, "title": c.title, "body": c.body, "productId": c.product_id}
            for c in chunks
        ]
        await qdrant.upsert(qdrant.knowledge, ids, vectors, payloads)
        print(f"Ingested {len(chunks)} KB chunks into '{qdrant.knowledge}' (dim={dim}).")
    finally:
        await container.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
