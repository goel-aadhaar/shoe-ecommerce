"""Domain-level catalog access built on top of MongoRepository.

Turns raw Mongo documents into the shapes the AI services need, and builds the
canonical text used to embed a product.
"""

from __future__ import annotations

from typing import Any

from bson import ObjectId

from app.repositories.mongo import MongoRepository


def _oid(value: str) -> ObjectId | str:
    return ObjectId(value) if ObjectId.is_valid(value) else value


# The catalog carries two document shapes: the one the current Mongoose model
# declares (rating / ratedBy / attributes[]) and the one the CSV importer
# actually wrote (averageRating / totalReviews / isTrending booleans). Reading
# only the first silently yields rating=None and an empty attribute list, which
# breaks popularity sorting and every attribute-filtered section.
_ATTRIBUTE_FLAGS = {
    "isTrending": "trending",
    "isNewArrival": "newArrival",
    "isFeatured": "bestSeller",
    "isOnSale": "onSale",
}


def product_rating(doc: dict[str, Any]) -> float | None:
    value = doc.get("rating")
    if value is None:
        value = doc.get("averageRating")
    return value


def product_rated_by(doc: dict[str, Any]) -> int:
    value = doc.get("ratedBy")
    if value is None:
        value = doc.get("totalReviews")
    return int(value or 0)


def product_attributes(doc: dict[str, Any]) -> list[str]:
    attrs = list(doc.get("attributes") or [])
    for flag, name in _ATTRIBUTE_FLAGS.items():
        if doc.get(flag) and name not in attrs:
            attrs.append(name)
    return attrs


def serialize_product(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(doc.get("_id")),
        "name": doc.get("name"),
        "brand": doc.get("brand"),
        "price": doc.get("price"),
        "gender": doc.get("for"),
        "color": doc.get("color"),
        "colors": doc.get("colors", []),
        "sizes": doc.get("sizes", []),
        "category": str(doc["category"]) if doc.get("category") else None,
        "rating": product_rating(doc),
        "attributes": product_attributes(doc),
        "thumbnail": doc.get("thumbnail"),
        "stock": doc.get("stock", 0),
        "description": doc.get("description"),
    }


def build_embedding_text(doc: dict[str, Any]) -> str:
    """Canonical text representation of a product for embedding."""
    parts = [
        doc.get("name", ""),
        doc.get("brand", ""),
        f"for {doc.get('for', '')}",
        doc.get("color", ""),
        " ".join(doc.get("colors", []) or []),
        " ".join(doc.get("tags", []) or []),
        " ".join(product_attributes(doc)),
        doc.get("description", ""),
    ]
    return " . ".join(p for p in parts if p).strip()


class CatalogRepository:
    def __init__(self, mongo: MongoRepository) -> None:
        self._mongo = mongo

    async def get_product(self, product_id: str) -> dict[str, Any] | None:
        doc = await self._mongo.products.find_one({"_id": _oid(product_id)})
        return serialize_product(doc) if doc else None

    async def get_products(self, product_ids: list[str]) -> list[dict[str, Any]]:
        oids = [_oid(pid) for pid in product_ids]
        cursor = self._mongo.products.find({"_id": {"$in": oids}})
        return [serialize_product(d) async for d in cursor]

    async def iter_all_products(self, batch_size: int = 200):
        cursor = self._mongo.products.find({}).batch_size(batch_size)
        async for doc in cursor:
            yield doc  # raw doc (callers may need build_embedding_text)

    async def count_products(self) -> int:
        return await self._mongo.products.count_documents({})

    async def get_reviews(self, product_id: str, limit: int = 500) -> list[dict[str, Any]]:
        cursor = self._mongo.reviews.find({"productId": _oid(product_id)}).limit(limit)
        return [
            {"rating": d.get("rating"), "text": d.get("reviewText", ""), "ts": d.get("createdAt")}
            async for d in cursor
        ]
