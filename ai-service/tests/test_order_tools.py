"""Order/payment/refund copilot tools, with emphasis on PII scoping.

The account tools expose another shopper's purchase history if scoping is ever
broken, so the isolation tests here matter more than the happy paths.
"""

from __future__ import annotations

import datetime as dt

import pytest
from bson import ObjectId

from app.core.config import Settings
from app.repositories.order_repo import OrderRepository

USER_A = ObjectId()
USER_B = ObjectId()
ORDER_A = ObjectId()
ORDER_B = ObjectId()
PRODUCT = ObjectId()
NOW = dt.datetime(2026, 7, 1, tzinfo=dt.timezone.utc)


class _Cursor:
    def __init__(self, rows):
        self._rows = rows

    def sort(self, *a, **k):
        return self

    def limit(self, *a, **k):
        return self

    def __aiter__(self):
        async def gen():
            for r in self._rows:
                yield r
        return gen()


class _Col:
    def __init__(self, rows):
        self.rows = rows

    def _match(self, q):
        out = []
        for r in self.rows:
            ok = True
            for k, v in (q or {}).items():
                if isinstance(v, dict) and "$in" in v:
                    if r.get(k) not in v["$in"]:
                        ok = False
                elif r.get(k) != v:
                    ok = False
            if ok:
                out.append(r)
        return out

    def find(self, q=None, projection=None):
        return _Cursor(self._match(q))

    async def find_one(self, q=None, projection=None):
        rows = self._match(q)
        return rows[0] if rows else None

    async def count_documents(self, q=None):
        return len(self._match(q))


class _Mongo:
    def __init__(self):
        self.orders = _Col([
            {"_id": ORDER_A, "userId": USER_A, "totalAmount": 4999,
             "currentStatus": "delivered", "createdAt": NOW},
            {"_id": ORDER_B, "userId": USER_B, "totalAmount": 9999,
             "currentStatus": "cancelled", "createdAt": NOW},
        ])
        self.order_items = _Col([
            {"orderId": ORDER_A, "productId": PRODUCT, "quantity": 1,
             "price": 4999, "selectedSize": "9", "selectedColor": "black"},
            {"orderId": ORDER_B, "productId": PRODUCT, "quantity": 1, "price": 9999},
        ])
        self.products = _Col([{"_id": PRODUCT, "name": "AIR MAX 90", "brand": "Nike"}])
        self.db = {
            "orderstatushistories": _Col([
                {"orderId": ORDER_A, "status": "pending", "changedAt": NOW},
                {"orderId": ORDER_A, "status": "delivered", "changedAt": NOW},
            ]),
            "payments": _Col([
                {"orderId": ORDER_A, "amount": 4999, "paymentMethod": "upi",
                 "paymentStatus": "success", "transactionId": "pi_abcdef1234567890",
                 "createdAt": NOW},
                {"orderId": ORDER_B, "amount": 9999, "paymentMethod": "card",
                 "paymentStatus": "success", "transactionId": "pi_zzz", "createdAt": NOW},
            ]),
        }


def _repo():
    return OrderRepository(_Mongo())


# --- PII scoping — the tests that matter -----------------------------------
@pytest.mark.asyncio
async def test_shopper_cannot_read_another_shoppers_order():
    """The owner filter is part of the query, so a foreign id returns nothing."""
    assert await _repo().get_order(str(USER_A), str(ORDER_B)) is None
    assert await _repo().get_order(str(USER_B), str(ORDER_A)) is None


@pytest.mark.asyncio
async def test_list_orders_returns_only_the_callers_orders():
    a = await _repo().list_orders(str(USER_A))
    assert [o["orderId"] for o in a] == [str(ORDER_A)]

    b = await _repo().list_orders(str(USER_B))
    assert [o["orderId"] for o in b] == [str(ORDER_B)]


@pytest.mark.asyncio
async def test_malformed_order_id_is_rejected_not_crashed():
    assert await _repo().get_order(str(USER_A), "not-an-object-id") is None
    assert await _repo().get_order(str(USER_A), "") is None


@pytest.mark.asyncio
async def test_full_transaction_reference_is_not_exposed():
    """Only a short suffix is surfaced — enough for support, not the full id."""
    detail = await _repo().get_order(str(USER_A), str(ORDER_A))
    assert detail["payment"]["reference"] == "1234567890"
    assert "pi_abcdef1234567890" not in str(detail)


# --- Content -----------------------------------------------------------------
@pytest.mark.asyncio
async def test_order_detail_includes_items_payment_and_timeline():
    detail = await _repo().get_order(str(USER_A), str(ORDER_A))
    assert detail["status"] == "delivered"
    assert detail["statusMeaning"]
    assert detail["items"][0]["name"] == "AIR MAX 90"
    assert detail["items"][0]["size"] == "9"
    assert detail["payment"]["method"] == "upi"
    assert detail["payment"]["status"] == "success"
    assert [t["status"] for t in detail["timeline"]] == ["pending", "delivered"]
    # Not cancelled -> no refund block.
    assert "refund" not in detail


@pytest.mark.asyncio
async def test_cancelled_order_reports_refund_when_payment_was_captured():
    detail = await _repo().get_order(str(USER_B), str(ORDER_B))
    assert detail["status"] == "cancelled"
    assert detail["refund"]["applicable"] is True
    assert "5-7 business days" in detail["refund"]["note"]


# --- Copilot tool gating -----------------------------------------------------
@pytest.mark.asyncio
async def test_order_tools_refuse_when_shopper_is_not_signed_in():
    """A guest must get an explicit not-signed-in signal, never invented orders."""
    from app.services.copilot_service import CopilotService

    svc = CopilotService(
        llm=None, search=None, recommender=None, content=None, redis=None,
        settings=Settings(_env_file=None), mongo=None, orders=_repo(), rag=None,
    )
    call = {"id": "1", "function": {"name": "get_my_orders", "arguments": "{}"}}
    out, products, extra = await svc._exec_tool(call, None, {})

    assert out["signedIn"] is False
    assert "not signed in" in out["note"].lower()
    assert products == []


@pytest.mark.asyncio
async def test_order_detail_tool_uses_session_identity_not_model_arguments():
    """A model-supplied userId must not widen access."""
    from app.services.copilot_service import CopilotService

    svc = CopilotService(
        llm=None, search=None, recommender=None, content=None, redis=None,
        settings=Settings(_env_file=None), mongo=None, orders=_repo(), rag=None,
    )
    # The model asks for B's order and even claims to be B; the session says A.
    call = {"id": "1", "function": {
        "name": "get_order_details",
        "arguments": '{"orderId": "%s", "userId": "%s"}' % (ORDER_B, USER_B),
    }}
    out, _, _ = await svc._exec_tool(call, str(USER_A), {})

    assert out["found"] is False
