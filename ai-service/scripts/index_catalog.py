"""CLI: embed the whole catalog into Qdrant.

    python -m scripts.index_catalog

Uses the same indexer the Celery task runs, so local and scheduled indexing
share one code path. Requires Mongo + Qdrant reachable and (for real vectors)
the embeddings model available.
"""

from __future__ import annotations

import asyncio

from app.core.logging import configure_logging, get_logger
from app.workers.indexer import reindex_catalog

logger = get_logger("scripts.index_catalog")


async def main() -> None:
    configure_logging()
    result = await reindex_catalog()
    logger.info("done", extra=result)
    print(f"Indexed {result['indexed']} products (dim={result['dim']}) into '{result['collection']}'.")


if __name__ == "__main__":
    asyncio.run(main())
