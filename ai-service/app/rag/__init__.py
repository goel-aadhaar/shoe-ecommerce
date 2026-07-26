"""Knowledge-base generation and ingestion for the RAG service.

Builds a small, demo-ready KB from the existing catalog (per-product specs /
fit notes / care guide) plus a fixed set of global docs (return policy, shipping,
FAQs, branding). Documents are chunked at a sentence boundary, embedded, and
upserted into the Qdrant ``knowledge`` collection with citation metadata.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

# Global docs that aren't derived from the catalog. In production these would be
# edited via a CMS; here they ship as constants so the KB is populated on first
# seed and the demo is self-contained.
GLOBAL_DOCS: list[dict] = [
    {
        "source": "policy",
        "title": "Return Policy",
        "body": (
            "We accept returns within 30 days of delivery for unworn shoes in their "
            "original box. To initiate a return, open the 'My Orders' page, select the "
            "order, and choose 'Return'. Refunds are issued to the original payment "
            "method within 5-7 business days after we receive the returned item. "
            "Final-sale items (clearly marked 'On Sale') are not eligible for return."
        ),
    },
    {
        "source": "policy",
        "title": "Shipping Policy",
        "body": (
            "We ship pan-India via DHL and Delhivery. Standard delivery takes 3-5 "
            "business days; express delivery takes 1-2 business days for most metro "
            "pin codes. Orders are processed within 24 hours on business days. Free "
            "shipping is offered on orders above ₹2,000; below that, a flat ₹99 fee "
            "applies. Tracking links are emailed once the order is dispatched."
        ),
    },
    {
        "source": "policy",
        "title": "Size & Fit Guide",
        "body": (
            "If you are between sizes, size up for running and training shoes and size "
            "down for casual or fashion sneakers. Our shoes run true to size for most "
            "customers. For wide feet, the 'New Balance' and 'Puma' lines tend to fit "
            "more comfortably. Each product page lists available sizes; if your size is "
            "out of stock, use the 'Notify Me' button to be alerted when it returns."
        ),
    },
    {
        "source": "policy",
        "title": "Shoe Care Guide",
        "body": (
            "Clean your shoes regularly with a soft brush and a damp cloth. For leather "
            "shoes, use a leather conditioner every 2-3 months. Avoid machine washing; "
            "instead, hand wash with mild soap and air dry away from direct sunlight. "
            "Use shoe trees or crumpled paper to maintain shape during storage. Replace "
            "insoles every 6-12 months for optimal comfort and hygiene."
        ),
    },
    {
        "source": "faq",
        "title": "Authenticity Guarantee",
        "body": (
            "Every pair of shoes sold on urban-sole is sourced directly from authorized "
            "brand distributors and is guaranteed 100% authentic. We do not sell "
            "counterfeit or replica products. If you ever receive a shoe that you "
            "suspect is not authentic, contact our support team for a full refund and "
            "investigation."
        ),
    },
    {
        "source": "policy",
        "title": "Refund Policy and Timelines",
        "body": (
            "Refunds are issued to the original payment method. Once we receive and "
            "inspect a returned item, the refund is initiated within 2 business days. "
            "After initiation, the money typically appears in 5-7 business days for "
            "cards and UPI, and up to 10 business days for net banking. If you paid by "
            "card, the refund goes back to that same card; we cannot redirect a refund "
            "to a different account. If an order is cancelled before dispatch, the full "
            "amount including shipping is refunded. If it is returned after delivery, "
            "the product price is refunded and the original shipping fee is not."
        ),
    },
    {
        "source": "policy",
        "title": "Order Status Explained",
        "body": (
            "Pending means the order is placed but payment is not yet confirmed. Paid "
            "means payment succeeded and the order is being packed. Shipped means it has "
            "left our warehouse and tracking is active. Delivered means the courier has "
            "handed it over. Cancelled means the order will not be fulfilled; any money "
            "already captured is refunded automatically. Orders can be cancelled by you "
            "at any time before they are marked Shipped, from the My Orders page."
        ),
    },
    {
        "source": "policy",
        "title": "Payment Methods and Failed Payments",
        "body": (
            "We accept Visa, Mastercard, RuPay and American Express cards, UPI, net "
            "banking, and popular wallets, processed securely through Stripe. We never "
            "store your full card number. Cash on delivery is not currently available. "
            "If a payment fails, no money is captured and the order stays in Pending; "
            "you can retry from the My Orders page. If your bank shows a debit for a "
            "failed payment, it is a temporary authorisation hold and is released "
            "automatically within 5-7 business days. EMI is available on select cards "
            "for orders above 5,000 rupees."
        ),
    },
    {
        "source": "faq",
        "title": "Tracking a Delivery",
        "body": (
            "Once an order is marked Shipped, a tracking link is emailed to you and is "
            "also visible on the My Orders page. Standard delivery takes 3-5 business "
            "days and express takes 1-2 business days to most metro pin codes. Delivery "
            "estimates exclude Sundays and public holidays. If tracking has not updated "
            "for more than 48 hours, contact support and we will raise it with the "
            "courier."
        ),
    },
    {
        "source": "faq",
        "title": "Exchanges and Wrong Size",
        "body": (
            "We do not process direct exchanges. To change size or colour, return the "
            "original item for a refund and place a new order — this is faster than an "
            "exchange and avoids the new size selling out while your return is in "
            "transit. Return pickup is free for size issues. The item must be unworn, "
            "with tags attached and in its original box."
        ),
    },
    {
        "source": "faq",
        "title": "Damaged, Wrong or Missing Items",
        "body": (
            "If an item arrives damaged, is the wrong product, or is missing from the "
            "parcel, report it within 48 hours of delivery through the My Orders page "
            "with photographs. We arrange a free pickup and issue a full refund or send "
            "a replacement at no cost. This is separate from the standard 30-day return "
            "window and is not affected by whether the item has been worn."
        ),
    },
    {
        "source": "policy",
        "title": "Invoices, GST and Order Changes",
        "body": (
            "A GST invoice is emailed when an order is dispatched and can be downloaded "
            "from the My Orders page at any time. Delivery addresses can be changed only "
            "while an order is Pending or Paid — once Shipped, the address is locked with "
            "the courier. Items cannot be added to an existing order; place a separate "
            "order instead."
        ),
    },
    {
        "source": "faq",
        "title": "Contacting Support",
        "body": (
            "Our support team is available Monday through Saturday, 10:00 to 19:00 IST. "
            "You can reach us via the 'Support' page, by email at help@urban-sole.test, "
            "or via the copilot chat on any page. For order-related queries, please "
            "have your order number ready."
        ),
    },
]


@dataclass(frozen=True)
class KbChunk:
    source: str
    title: str
    body: str
    product_id: str | None = None


def _sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]


def _chunk(text: str, max_chars: int = 380) -> list[str]:
    """Greedy sentence-boundary chunking so each chunk fits a typical embedding
    context and reads cleanly."""
    sents = _sentences(text)
    if not sents:
        return []
    out: list[str] = []
    buf = ""
    for s in sents:
        if len(buf) + len(s) + 1 > max_chars and buf:
            out.append(buf.strip())
            buf = s
        else:
            buf = (buf + " " + s).strip()
    if buf:
        out.append(buf.strip())
    return out


def build_global_chunks() -> list[KbChunk]:
    chunks: list[KbChunk] = []
    for doc in GLOBAL_DOCS:
        for chunk in _chunk(doc["body"]):
            chunks.append(KbChunk(source=doc["source"], title=doc["title"], body=chunk))
    return chunks


def build_product_chunks(product: dict) -> list[KbChunk]:
    """Derive KB docs from a product's catalog fields. Returns 3-5 chunks:
    profile, sizing/fit, and care/use notes."""
    pid = str(product["_id"])
    name = product.get("name") or "These shoes"
    brand = product.get("brand") or ""
    price = product.get("price")
    gender = product.get("for", "")
    color = product.get("color") or ""
    rating = product.get("rating")
    rated_by = product.get("ratedBy")
    sizes = product.get("sizes") or []
    attrs = product.get("attributes") or []
    desc = product.get("description") or "No description available."

    profile_body = (
        f"{name} by {brand}. A {gender.lower()}'s shoe available in {color}, "
        f"priced at ₹{price}. Customer rating: {rating}/5 across {rated_by} reviews."
    )
    chunks = [KbChunk("product", name, profile_body, product_id=pid)]

    sizing_body = (
        f"Available sizes: {', '.join(map(str, sizes))}. "
        f"As a {('trending' if 'trending' in attrs else 'new arrival' if 'newArrival' in attrs else 'regular')} "
        f"{brand} shoe, {name} is generally true to size. For running and training, "
        f"we recommend ordering your usual size; for casual everyday wear, you can "
        f"size down by half if you prefer a snug fit."
    )
    chunks.append(KbChunk("product", f"{name} — sizing", sizing_body, product_id=pid))

    use_body = (
        f"{name} is best suited for {', '.join(a for a in attrs) if attrs else 'everyday use'}. "
        f"{brand} shoes are known for durability and everyday comfort. {desc}"
    )
    chunks.append(KbChunk("product", f"{name} — use", use_body, product_id=pid))

    return chunks


def build_all_chunks(products: Iterable[dict]) -> list[KbChunk]:
    chunks: list[KbChunk] = list(build_global_chunks())
    for product in products:
        chunks.extend(build_product_chunks(product))
    return chunks
