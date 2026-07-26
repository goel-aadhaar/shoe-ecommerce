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
