"""RAG product-knowledge assistant.

The KB lives in the Qdrant ``knowledge`` collection (built by
``scripts/ingest_knowledge.py``). RAG: embed the question, retrieve top-k
chunks filtered by an optional productId, build a grounded prompt with the
retrieved context, and answer with explicit citations. Refuses to answer when
the KB doesn't cover the question.
"""

from __future__ import annotations

import json

from qdrant_client import models

from app.clients.embeddings import Embedder
from app.core.config import Settings
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.llm.client import LLMClient
from app.repositories.qdrant_repo import QdrantRepository
from app.repositories.redis_repo import RedisRepository
from app.schemas.content import AskRequest, AskResponse, Citation

logger = get_logger("app.rag")

# Token-bounded context: keep the prompt comfortably small with margin for the
# model's answer and reasoning traces.
_MAX_CONTEXT_CHARS = 2400
_TOP_K = 5
_CACHE_TTL = 600  # 10 min — questions are rarely unique, this halves LLM calls


_ANSWER_TOOL: dict = {
    "type": "function",
    "function": {
        "name": "answer",
        "description": "Deliver a grounded answer based on the retrieved context.",
        "parameters": {
            "type": "object",
            "properties": {
                "answer": {
                    "type": "string",
                    "description": "A concise, grounded answer (or a refusal if unsupported).",
                },
                "citations": {
                    "type": "array",
                    "description": "Indices of the supporting context paragraphs (1-based).",
                    "items": {"type": "integer"},
                },
            },
            "required": ["answer", "citations"],
        },
    },
}

_GUARD_PROMPT = """\
You are the urban-sole knowledge assistant. Answer ONLY using the numbered
context paragraphs below. If the answer is not in the context, set the answer
to "I don't have that information." and citations to [].

Rules:
- Be concise and friendly. Reference numbers like [1] when quoting.
- Never invent specs, prices, or policies. If the context is thin, say so.
- Trigger answer.tool_choice = required and call the ``answer`` tool."""


class RagService:
    def __init__(
        self,
        embedder: Embedder,
        qdrant: QdrantRepository,
        llm: LLMClient,
        redis: RedisRepository,
        settings: Settings,
    ) -> None:
        self._embedder = embedder
        self._qdrant = qdrant
        self._llm = llm
        self._redis = redis
        self._settings = settings

    async def ask(self, req: AskRequest) -> AskResponse:
        cached = await self._cache_get(req.question, req.productId)
        if cached is not None:
            return cached

        vector = self._embedder.embed_one(req.question)
        query_filter = None
        if req.productId:
            query_filter = models.Filter(
                should=[
                    models.FieldCondition(key="productId",
                                          match=models.MatchValue(value=req.productId)),
                    models.FieldCondition(key="source", match=models.MatchValue(value="policy")),
                    models.FieldCondition(key="source", match=models.MatchValue(value="faq")),
                ]
            )
        hits = await self._qdrant.search(
            self._qdrant.knowledge, vector, limit=_TOP_K, query_filter=query_filter
        )
        if not hits:
            raise NotFoundError(
                "The knowledge base has no chunks yet. Run `python -m scripts.ingest_knowledge`."
            )

        context, references = self._build_context(hits)
        prompt = (
            f"Context:\n{context}\n\nQuestion: {req.question.strip()}\n"
            "Call the `answer` tool now."
        )
        result = await self._llm.chat(
            [
                {"role": "system", "content": _GUARD_PROMPT},
                {"role": "user", "content": prompt},
            ],
            tools=[_ANSWER_TOOL],
            tool_choice={"type": "function", "function": {"name": "answer"}},
            temperature=0.2,
            max_tokens=500,
        )

        if not result.tool_calls:
            answer = result.content or "I don't have that information."
            citations: list[Citation] = []
            grounded = False
        else:
            try:
                payload = json.loads(result.tool_calls[0]["function"].get("arguments") or "{}")
            except json.JSONDecodeError:
                payload = {}
            answer = (payload.get("answer") or "").strip()
            indices = payload.get("citations") or []
            citations = [
                references[i - 1] for i in indices if isinstance(i, int) and 1 <= i <= len(references)
            ]
            grounded = bool(citations) and answer.lower() != "i don't have that information."

        response = AskResponse(answer=answer or "I don't have that information.",
                               citations=citations, grounded=grounded)
        await self._cache_set(req.question, req.productId, response)
        return response

    # ---------------------------------------------------------------- helpers
    def _build_context(self, hits: list[dict]) -> tuple[str, list[Citation]]:
        references: list[Citation] = []
        bits: list[str] = []
        used = 0
        for h in hits:
            payload = h.get("payload") or {}
            body = (payload.get("body") or "").strip()
            if not body:
                continue
            # Number by position in `references`, NOT by position in `hits` —
            # a skipped (empty-body) hit would otherwise shift every later
            # citation by one and make [n] resolve to the wrong document.
            header = f"[{len(references) + 1}] {payload.get('title', 'Reference')}"
            block = f"{header}\n{body}"
            if used + len(block) > _MAX_CONTEXT_CHARS:
                break
            bits.append(block)
            used += len(block)
            references.append(
                Citation(
                    source=payload.get("source", "kb"),
                    title=payload.get("title"),
                    productId=payload.get("productId"),
                )
            )
        return "\n\n".join(bits), references

    async def _cache_get(self, q: str, product_id: str | None) -> AskResponse | None:
        try:
            data = await self._redis.get_json(f"rag:{product_id or 'g'}:{q.lower().strip()}")
            return AskResponse(**data) if data else None
        except Exception:  # noqa: BLE001
            return None

    async def _cache_set(self, q: str, product_id: str | None, resp: AskResponse) -> None:
        try:
            await self._redis.set_json(
                f"rag:{product_id or 'g'}:{q.lower().strip()}",
                resp.model_dump(),
                ttl=_CACHE_TTL,
            )
        except Exception:  # noqa: BLE001
            pass
