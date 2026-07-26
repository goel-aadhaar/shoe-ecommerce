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
