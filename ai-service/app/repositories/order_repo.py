"""Order, payment and refund access for the copilot.

SECURITY: every method requires a ``user_id`` and filters on it. There is no
method that fetches an order by id alone — an LLM must never be able to widen
its own scope by passing someone else's order id, and the model-supplied
arguments are treated as untrusted throughout. The ``user_id`` given to these
methods always originates from the verified session on the Express BFF, never
from the conversation.
"""

from __future__ import annotations

import datetime as dt
from typing import Any

from bson import ObjectId

from app.core.logging import get_logger
from app.repositories.mongo import MongoRepository

logger = get_logger("app.orders")

# Shopper-facing explanation of each order state.
STATUS_MEANING = {
    "pending": "Order placed, awaiting payment confirmation.",
    "paid": "Payment confirmed. Being prepared for dispatch.",
    "shipped": "Dispatched and on its way.",
    "delivered": "Delivered.",
    "cancelled": "Cancelled. Any captured payment is refunded.",
}

PAYMENT_MEANING = {
    "success": "Payment successful.",
    "pending": "Payment is still being confirmed by the provider.",
    "failed": "Payment failed — no money was captured.",
}


def _id_variants(value: str) -> list:
    """Match ids written as either ObjectId or string."""
    variants: list = [value]
    if ObjectId.is_valid(value):
        variants.append(ObjectId(value))
    return variants


def _iso(value: Any) -> str | None:
    if isinstance(value, dt.datetime):
        return value.date().isoformat()
    return None


class OrderRepository:
    def __init__(self, mongo: MongoRepository) -> None:
        self._mongo = mongo

    async def list_orders(self, user_id: str, limit: int = 5) -> list[dict[str, Any]]:
        """The shopper's most recent orders, newest first."""
        cursor = (
            self._mongo.orders.find({"userId": {"$in": _id_variants(user_id)}})
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 20)))
        )
        orders = [o async for o in cursor]
        out: list[dict[str, Any]] = []
        for o in orders:
            oid = o["_id"]
            items = await self._mongo.order_items.count_documents({"orderId": oid})
            status = o.get("currentStatus", "pending")
            out.append({
                "orderId": str(oid),
                "placedOn": _iso(o.get("createdAt")),
                "status": status,
                "statusMeaning": STATUS_MEANING.get(status, ""),
                "totalAmount": o.get("totalAmount"),
                "itemCount": items,
            })
        return out

    async def get_order(self, user_id: str, order_id: str) -> dict[str, Any] | None:
        """Full detail for ONE order — only if it belongs to this shopper.

        The user filter is part of the query, not a check afterwards, so a
        mismatched owner simply returns nothing.
        """
        if not ObjectId.is_valid(order_id):
            return None
        order = await self._mongo.orders.find_one({
            "_id": ObjectId(order_id),
            "userId": {"$in": _id_variants(user_id)},
        })
        if not order:
            logger.info("order_lookup_denied_or_missing", extra={"orderId": order_id})
            return None

        oid = order["_id"]

        items = []
        async for it in self._mongo.order_items.find({"orderId": oid}):
            product = await self._mongo.products.find_one(
                {"_id": it.get("productId")}, {"name": 1, "brand": 1}
            )
            items.append({
                "name": (product or {}).get("name", "Unknown product"),
                "brand": (product or {}).get("brand"),
                "quantity": it.get("quantity", 1),
                "price": it.get("price"),
                "size": it.get("selectedSize"),
                "colour": it.get("selectedColor"),
            })

        timeline = []
        async for h in self._mongo.db["orderstatushistories"].find({"orderId": oid}).sort("changedAt", 1):
            timeline.append({"status": h.get("status"), "on": _iso(h.get("changedAt"))})

        payment = await self._mongo.db["payments"].find_one({"orderId": oid})
        payment_info = None
        if payment:
            pstatus = payment.get("paymentStatus", "pending")
            payment_info = {
                "method": payment.get("paymentMethod"),
                "status": pstatus,
                "statusMeaning": PAYMENT_MEANING.get(pstatus, ""),
                "amount": payment.get("amount"),
                # Reference only — useful to the shopper for support tickets.
                "reference": (payment.get("transactionId") or "")[-10:] or None,
                "paidOn": _iso(payment.get("createdAt")),
            }

        status = order.get("currentStatus", "pending")
        detail: dict[str, Any] = {
            "orderId": str(oid),
            "placedOn": _iso(order.get("createdAt")),
            "status": status,
            "statusMeaning": STATUS_MEANING.get(status, ""),
            "totalAmount": order.get("totalAmount"),
            "items": items,
            "timeline": timeline,
            "payment": payment_info,
        }

        # Refund state is derived: a cancelled order whose payment succeeded is
        # money owed back to the shopper.
        if status == "cancelled":
            captured = bool(payment and payment.get("paymentStatus") == "success")
            detail["refund"] = {
                "applicable": captured,
                "note": (
                    "Refund of the full amount has been initiated to the original "
                    "payment method. Banks typically post it within 5-7 business days."
                    if captured
                    else "No payment was captured, so there is nothing to refund."
                ),
            }
        return detail
