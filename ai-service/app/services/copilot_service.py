"""Conversational shopping copilot — an LLM agent with tools and memory.

Loop: load session memory + preference slots (Redis) -> update slots from the
new message (structured NL->filters) -> run the tool-calling loop (search /
recommend / compare against the real catalog) -> compose a grounded reply ->
persist memory. Reasoning ``<think>`` output from the MiniMax models is stripped
by the LLM client before anything reaches the shopper.
"""

from __future__ import annotations

import datetime as dt
import json

from app.core.config import Settings
from app.core.logging import get_logger
from app.llm.client import LLMClient
from app.llm.prompts import COPILOT_SYSTEM, COPILOT_TOOLS, EXTRACT_SYSTEM, EXTRACT_TOOL
from app.repositories.mongo import MongoRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.redis_repo import RedisRepository
from app.schemas.chat import ChatRequest, ChatResponse, ExtractedFilters, ExtractFiltersRequest
from app.schemas.common import ScoredProduct
from app.schemas.content import CompareRequest
from app.schemas.recommend import HomeSection, RecommendRequest
from app.schemas.search import SearchFilters, SemanticSearchRequest
from app.services.content_service import ContentService
from app.services.rag_service import RagService
from app.services.recommender_service import RecommenderService
from app.services.search_service import SearchService

logger = get_logger("app.copilot")

_MAX_STEPS = 3
_MEMORY_TURNS = 8
# MiniMax spends a large, variable share of the budget on hidden <think> tokens
# before any visible text, so answer budgets must be generous or the reply
# strips down to nothing.
_TURN_MAX_TOKENS = 1500
_FINAL_ANSWER_MAX_TOKENS = 1500
_PREF_KEYS = ("size", "gender", "brand", "colour", "category", "maxPrice", "minPrice")


class CopilotService:
    def __init__(
        self,
        llm: LLMClient,
        search: SearchService,
        recommender: RecommenderService,
        content: ContentService,
        redis: RedisRepository,
        settings: Settings,
        mongo: MongoRepository | None = None,
        orders: OrderRepository | None = None,
        rag: RagService | None = None,
    ) -> None:
        self._llm = llm
        self._search = search
        self._recommender = recommender
        self._content = content
        self._redis = redis
        self._settings = settings
        self._mongo = mongo
        self._orders = orders
        self._rag = rag

    # ------------------------------------------------------------------ chat
    async def chat(self, req: ChatRequest) -> ChatResponse:
        session = await self._load_session(req.sessionId)
        prefs: dict = session.get("preferences", {})

        await self._update_preferences(req.message, prefs)

        messages = self._build_messages(session["messages"], prefs, req.message)
        products: list[ScoredProduct] = []
        comparison: dict | None = None
        reply = ""

        for _ in range(_MAX_STEPS):
            result = await self._llm.chat(
                messages, tools=COPILOT_TOOLS, tool_choice="auto",
                max_tokens=_TURN_MAX_TOKENS,
            )
            if result.tool_calls:
                assistant = result.raw["choices"][0]["message"]
                messages.append({
                    "role": "assistant",
                    "content": assistant.get("content") or "",
                    "tool_calls": assistant["tool_calls"],
                })
                for call in result.tool_calls:
                    output, prods, extra = await self._exec_tool(call, req.userId, prefs)
                    products.extend(prods)
                    if extra.get("comparison"):
                        comparison = extra["comparison"]
                    messages.append({
                        "role": "tool",
                        "tool_call_id": call.get("id"),
                        "content": json.dumps(output, default=str),
                    })
                continue
            reply = result.content
            break

        # The model can spend the whole step budget re-searching (it does this
        # when the catalog has nothing close to the request). Force a written
        # answer with tools disabled so the shopper never gets a canned line.
        if not reply:
            reply = await self._force_answer(messages)

        # Show the products the reply actually talks about. The loop accumulates
        # every hit from every tool call, so without this the cards can show
        # clogs while the text recommends running shoes.
        products = _align_with_reply(reply, _dedupe(products))[:8]
        if not reply:
            if comparison:
                reply = comparison.get("recommendation") or (
                    "Here's how they stack up — see the comparison below."
                )
            elif products:
                reply = "Here are some options I found for you."
            else:
                reply = (
                    "Could you tell me a bit more about what you're after — "
                    "budget, colour, or how you'll use them?"
                )

        await self._save_session(req.sessionId, session, prefs, req.message, reply, req.userId)
        return ChatResponse(
            reply=reply,
            products=products,
            why=[p.reason for p in products if p.reason][:4],
            followUp=None,
            sessionId=req.sessionId,
        )

    async def _force_answer(self, messages: list[dict]) -> str:
        """Ask for prose with no tools available, so the model must respond.

        Also tells it plainly that searching is over — otherwise it tries to
        justify another lookup instead of answering with what it already has.
        """
        try:
            result = await self._llm.chat(
                [
                    *messages,
                    {
                        "role": "system",
                        "content": (
                            "Do not search again and do not ask any permission "
                            "question. Using ONLY the tool results already returned, "
                            "answer now: recommend 2-4 of the products you found, each "
                            "with its price and a few words on why it fits, using '- ' "
                            "bullets and **bold** product names. Add at most one short "
                            "closing caveat if none is an exact match."
                        ),
                    },
                ],
                temperature=0.4,
                # Generous: this model emits hidden reasoning first, and a
                # truncated <think> block strips down to an empty answer.
                max_tokens=_FINAL_ANSWER_MAX_TOKENS,
            )
            answer = result.content.strip()
            if not answer:
                logger.warning(
                    "force_answer_empty",
                    extra={"finish": result.finish_reason,
                           "completion": result.usage.get("completion_tokens")},
                )
            return answer
        except Exception as exc:  # noqa: BLE001
            logger.warning("force_answer_failed", extra={"err": str(exc)})
            return ""

    # ------------------------------------------------------------- extract
    async def extract_filters(self, req: ExtractFiltersRequest) -> ExtractedFilters:
        return await self._extract(req.query)

    async def _extract(self, text: str) -> ExtractedFilters:
        try:
            result = await self._llm.chat(
                [
                    {"role": "system", "content": EXTRACT_SYSTEM},
                    {"role": "user", "content": text},
                ],
                tools=[EXTRACT_TOOL],
                tool_choice="auto",
                temperature=0.0,
                max_tokens=300,
                # Slot extraction runs on every message before the agent loop can
                # start, so it sits directly on the user's latency path. Use the
                # low-latency model variant — this is a narrow extraction task.
                highspeed=True,
            )
            if result.tool_calls:
                args = json.loads(result.tool_calls[0]["function"].get("arguments") or "{}")
                valid = {k: v for k, v in args.items() if k in ExtractedFilters.model_fields}
                return ExtractedFilters(**valid)
        except Exception as exc:  # noqa: BLE001
            logger.warning("extract_filters_failed", extra={"err": str(exc)})
        return ExtractedFilters()

    async def _update_preferences(self, message: str, prefs: dict) -> None:
        extracted = await self._extract(message)
        data = extracted.model_dump(exclude_none=True)
        for key in _PREF_KEYS:
            if data.get(key):
                prefs[key] = data[key]

    # --------------------------------------------------------------- tools
    async def _exec_tool(
        self, call: dict, user_id: str | None, prefs: dict
    ) -> tuple[dict, list[ScoredProduct], dict]:
        name = call.get("function", {}).get("name")
        try:
            args = json.loads(call["function"].get("arguments") or "{}")
        except (json.JSONDecodeError, KeyError):
            args = {}

        if name == "search_products":
            filters = SearchFilters(
                category=args.get("category"),
                brand=args.get("brand"),
                colour=args.get("colour"),
                gender=args.get("gender") or prefs.get("gender"),
                minPrice=args.get("minPrice") or prefs.get("minPrice"),
                maxPrice=args.get("maxPrice") or prefs.get("maxPrice"),
            )
            query = args.get("query") or " ".join(
                filter(None, [args.get("colour"), args.get("brand"), args.get("category"), "shoes"])
            )
            resp = await self._search.semantic_search(
                SemanticSearchRequest(
                    query=query, filters=filters, userId=user_id,
                    limit=min(int(args.get("limit", 6)), 8),
                )
            )
            return _tool_products(resp.results), resp.results, {}

        if name == "get_recommendations":
            resp = await self._recommender.recommend(
                RecommendRequest(
                    userId=user_id, section=HomeSection.recommended_for_you,
                    limit=min(int(args.get("limit", 6)), 8),
                )
            )
            return _tool_products(resp.items), resp.items, {}

        # --- Account-scoped tools -------------------------------------------
        # `user_id` comes from the verified session on the BFF. It is never read
        # from the model's arguments, so the LLM cannot widen its own access.
        if name in ("get_my_orders", "get_order_details"):
            if not user_id:
                return {
                    "signedIn": False,
                    "note": ("The shopper is not signed in, so no order information is "
                             "available. Ask them to sign in — do not guess."),
                }, [], {}
            if self._orders is None:
                return {"error": "Order lookup is unavailable."}, [], {}

            if name == "get_my_orders":
                orders = await self._orders.list_orders(user_id, int(args.get("limit", 5)))
                return {
                    "signedIn": True,
                    "orderCount": len(orders),
                    "orders": orders,
                    "note": ("These are the shopper's real orders. Do not invent tracking "
                             "numbers or delivery dates beyond what is shown."),
                }, [], {}

            order_id = str(args.get("orderId") or "").strip()
            detail = await self._orders.get_order(user_id, order_id)
            if not detail:
                return {
                    "found": False,
                    "note": ("No such order on this shopper's account. Do not speculate; "
                             "offer to list their recent orders instead."),
                }, [], {}
            return {"found": True, "order": detail}, [], {}

        if name == "answer_from_policy":
            question = str(args.get("question") or "").strip()
            if not question or self._rag is None:
                return {"error": "No policy question provided."}, [], {}
            try:
                from app.schemas.content import AskRequest

                answer = await self._rag.ask(AskRequest(question=question))
                return {
                    "answer": answer.answer,
                    "grounded": answer.grounded,
                    "sources": [c.title for c in answer.citations if c.title],
                    "note": ("Official policy text. Quote these timelines exactly; do not "
                             "round or embellish them."),
                }, [], {}
            except Exception as exc:  # noqa: BLE001
                logger.warning("policy_lookup_failed", extra={"err": str(exc)})
                return {"error": "Policy lookup unavailable."}, [], {}

        if name == "compare_products":
            ids = [str(i) for i in (args.get("productIds") or []) if i][:5]
            if len(ids) < 2:
                return {"error": "compare_products needs at least two productIds"}, [], {}
            resp = await self._content.compare(CompareRequest(productIds=ids))
            return (
                {"recommendation": resp.recommendation},
                [],
                {"comparison": {
                    "productIds": [p.id for p in resp.products],
                    "recommendation": resp.recommendation,
                }},
            )

        return {"error": f"unknown tool {name}"}, [], {}

    # -------------------------------------------------------------- memory
    async def _load_session(self, session_id: str) -> dict:
        try:
            session = await self._redis.get_session(session_id)
        except Exception:  # noqa: BLE001
            session = None
        return session or {"messages": [], "preferences": {}}

    def _build_messages(self, history: list[dict], prefs: dict, message: str) -> list[dict]:
        messages: list[dict] = [{"role": "system", "content": COPILOT_SYSTEM}]
        if prefs:
            messages.append({
                "role": "system",
                "content": "Known shopper preferences: " + json.dumps(prefs),
            })
        messages.extend(history[-_MEMORY_TURNS:])
        messages.append({"role": "user", "content": message})
        return messages

    async def _save_session(
        self, session_id: str, session: dict, prefs: dict, user_msg: str, reply: str,
        user_id: str | None = None,
    ) -> None:
        history = session.get("messages", [])
        history += [{"role": "user", "content": user_msg}, {"role": "assistant", "content": reply}]
        session["messages"] = history[-(_MEMORY_TURNS * 2):]
        session["preferences"] = prefs
        try:
            await self._redis.save_session(session_id, session)
        except Exception:  # noqa: BLE001
            pass
        # Durable copy: Redis is the hot path, but analytics (and any later
        # transcript review) needs a persistent record. Without this the
        # chatSessions collection is never written and copilot metrics read 0.
        if self._mongo is not None:
            try:
                await self._mongo.chat_sessions.update_one(
                    {"sessionId": session_id},
                    {
                        "$set": {
                            "sessionId": session_id,
                            "userId": user_id,
                            "messages": session["messages"],
                            "preferences": prefs,
                            "updatedAt": dt.datetime.now(dt.timezone.utc),
                        },
                        "$setOnInsert": {"createdAt": dt.datetime.now(dt.timezone.utc)},
                    },
                    upsert=True,
                )
            except Exception:  # noqa: BLE001
                logger.warning("chat_session_persist_failed", extra={"sessionId": session_id})


def _tool_products(items: list[ScoredProduct]) -> dict:
    """Tool result for the model.

    Includes an explicit note when the catalog has nothing close, otherwise the
    model burns the whole step budget rephrasing the same search instead of
    telling the shopper the truth.
    """
    payload: dict = {
        "count": len(items),
        "products": [
            {"id": p.id, "name": p.name, "brand": p.brand, "price": p.price, "color": p.color}
            for p in items
        ],
    }
    if not items:
        payload["note"] = (
            "No matches at all. Do NOT search again and do NOT ask permission to "
            "search. Tell the shopper plainly that we don't carry this, and "
            "suggest the closest category we do stock."
        )
    else:
        payload["note"] = (
            "These ARE the closest available products — recommend them now. "
            "Do NOT search again and do NOT ask 'would you like me to search "
            "instead?'. Present 2-4 of these with prices and why they fit, then "
            "add at most one short caveat if they aren't an exact match."
        )
    return payload


def _align_with_reply(reply: str, items: list[ScoredProduct]) -> list[ScoredProduct]:
    """Keep only the products the assistant actually named, in reply order.

    The agent may search several times and also pull generic recommendations;
    every hit lands in ``items``. Rendering those verbatim shows cards that
    contradict the text ("here are running shoes" beside a pair of clogs), so
    the reply is the source of truth for what to display.

    Falls back to the unfiltered list when nothing matches, so a reply that
    describes products without naming them still shows something.
    """
    if not reply or not items:
        return items

    haystack = " ".join(reply.lower().split())
    positions: list[tuple[int, ScoredProduct]] = []
    for product in items:
        name = " ".join((product.name or "").lower().split())
        if not name:
            continue
        idx = haystack.find(name)
        if idx == -1 and len(name) > 12:
            # Models often shorten long names; try a distinctive prefix.
            idx = haystack.find(name[:12])
        if idx != -1:
            positions.append((idx, product))

    if not positions:
        return items
    positions.sort(key=lambda pair: pair[0])
    return [product for _, product in positions]


def _dedupe(items: list[ScoredProduct]) -> list[ScoredProduct]:
    seen: set[str] = set()
    out: list[ScoredProduct] = []
    for p in items:
        if p.id not in seen:
            seen.add(p.id)
            out.append(p)
    return out
