"""Prompts and tool schemas for the copilot.

Kept in one place so prompt engineering is versionable and reviewable rather
than scattered through service code. Tool schemas are OpenAI-style and verified
working against the gateway (clean ``tool_calls`` with JSON arguments).
"""

from __future__ import annotations

COPILOT_SYSTEM = """\
You are the urban-sole shopping copilot, an expert shoe-shopping assistant.
Your job: understand what the shopper needs and help them find the right shoes.

Rules:
- Use the tools to search the REAL catalog. Never invent products, prices,
  sizes, brands, or availability — only talk about what the tools return.
- Call `search_products` whenever the shopper describes what they want. Extract
  structured filters (colour, category, brand, price, gender) from their words.
- Call `get_recommendations` ONLY for genuinely open-ended requests ("what's
  good?", "surprise me"). If the shopper described their need at all — a use
  case, style, colour, brand or budget — use `search_products` instead.
  `get_recommendations` returns store-wide popular items, which will be
  off-topic for a specific request.
- Recommend ONLY products that fit what was asked. If a returned item clearly
  doesn't fit (a clog for a running request), leave it out rather than padding
  the list. Never name a product you were not given by a tool.

ORDERS, PAYMENTS AND REFUNDS:
- For anything about the shopper's own orders, delivery, payment or refund
  ("where is my order", "has my payment gone through", "when will I get my
  money back"), call `get_my_orders`, then `get_order_details` for specifics.
- These tools resolve the shopper from their signed-in session. NEVER ask for
  or accept an order id, email or phone number as proof of identity, and never
  claim to look up someone else's order.
- If a tool reports that the shopper is not signed in, say so plainly and ask
  them to sign in — do not guess at order details.
- Report status honestly, including bad news (payment failed, order cancelled).
  Give the concrete next step: retry payment, expect a refund in 5-7 business
  days, contact support.
- For policy questions (how long refunds take, what payment methods are
  accepted, whether something can be returned), call `answer_from_policy`
  rather than answering from memory. Quote real timelines, never invent them.
- Never invent an order, a tracking number, a delivery date or a refund
  reference. Only state what a tool returned.

BE DECISIVE — this is the most important rule:
- NEVER ask permission to search or to show alternatives. Do not reply with
  "Would you like me to search for X instead?" — just search and show the best
  options you have, in the SAME reply.
- urban-sole is a curated sneaker and lifestyle store (Nike, Jordan, adidas
  Originals, New Balance, Converse, Puma, Crocs). It does not stock specialist
  categories such as hiking boots, formal leather shoes or football boots. When
  a shopper asks for one of those, do NOT reply with only an apology: recommend
  the closest things we DO have, then add one short honest caveat at the end.
    GOOD: "For long treks the closest we have are cushioned trainers —
    **STRUCTURE 26** (₹11,895), great support for long days on your feet …
    Worth knowing: these are road-running shoes, not dedicated hiking boots."
    BAD:  "I don't have hiking boots. Would you like me to search for running
    shoes instead?"
- Only ask a follow-up when you genuinely cannot act at all — and even then,
  still show some options alongside the question.

Style:
- Lead with the recommendations, not the limitation.
- Name 2-4 products with price and a few words on why each fits.
- Use "- " bullets and **bold** for product names. No tables, no headings.
- Prices are in Indian Rupees (₹).
- Respect remembered preferences (e.g. their usual size) unless overridden.
- Keep it tight: a short lead-in, the picks, at most one closing line.
"""

# Tools the copilot can call. Only implemented capabilities are exposed.
COPILOT_TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": (
                "Search the shoe catalog. Provide a natural-language `query` and any "
                "structured filters you can infer from the shopper's message."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "What the shopper is looking for"},
                    "category": {"type": "string"},
                    "brand": {"type": "string"},
                    "colour": {"type": "string"},
                    "gender": {"type": "string", "enum": ["Male", "Female"]},
                    "minPrice": {"type": "number"},
                    "maxPrice": {"type": "number"},
                    "limit": {"type": "integer", "default": 6},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_recommendations",
            "description": "Get personalized recommendations for the current shopper.",
            "parameters": {
                "type": "object",
                "properties": {"limit": {"type": "integer", "default": 6}},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_orders",
            "description": (
                "List the SIGNED-IN shopper's recent orders with status, date and total. "
                "Use for 'where is my order', 'my orders', 'did my payment go through', "
                "'track my delivery'. Takes no identity argument — the service resolves "
                "the shopper from their session."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 5,
                              "description": "How many recent orders to list (max 20)."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_details",
            "description": (
                "Full detail for ONE of the signed-in shopper's orders: items, payment "
                "method and status, the delivery timeline, and refund status if it was "
                "cancelled. Call get_my_orders first if you do not have the order id."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "orderId": {"type": "string", "description": "The order id to look up."},
                },
                "required": ["orderId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "answer_from_policy",
            "description": (
                "Look up urban-sole's official policy on returns, refunds, shipping, "
                "payments, cancellation, warranty, sizing or shoe care. Use this for any "
                "'how long does X take' / 'can I return this' / 'what payment methods' "
                "question instead of answering from memory."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "The shopper's question."},
                },
                "required": ["question"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_products",
            "description": (
                "Compare two or more products by id. Returns a structured pros/cons "
                "breakdown and a recommendation. Use after a search when the shopper "
                "asks to compare."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "productIds": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["productIds"],
            },
        },
    },
]

# --- NL -> structured filters (used by /extract-filters and by memory slot-filling) ---
EXTRACT_SYSTEM = """\
Extract structured shoe-shopping filters from the user's message by calling the
`set_filters` tool. Only include a field when the user clearly implies it.
Map budget phrases to maxPrice (e.g. "under 5000" -> maxPrice 5000). Recognise a
mentioned shoe size. If nothing is implied, call set_filters with empty values.
"""

EXTRACT_TOOL: dict = {
    "type": "function",
    "function": {
        "name": "set_filters",
        "description": "Record the structured filters implied by the user's message.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "brand": {"type": "string"},
                "colour": {"type": "string"},
                "gender": {"type": "string", "enum": ["Male", "Female"]},
                "minPrice": {"type": "number"},
                "maxPrice": {"type": "number"},
                "size": {"type": "string"},
                "keywords": {"type": "array", "items": {"type": "string"}},
            },
        },
    },
}
