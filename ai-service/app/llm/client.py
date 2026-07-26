"""Async client for the OpenAI-compatible LLM gateway.

Thin, dependency-light wrapper (httpx, not the OpenAI SDK) around
``POST /chat/completions``. Supports plain chat, function/tool calling, and
JSON-structured outputs. Reasoning ``<think>`` blocks are stripped from the
visible answer. Transient failures are retried with backoff.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import Settings
from app.core.exceptions import DependencyUnavailable
from app.core.logging import get_logger
from app.llm.reasoning import strip_reasoning

logger = get_logger("app.llm")

_RETRYABLE = (httpx.TransportError, httpx.HTTPStatusError)


@dataclass(slots=True)
class ChatResult:
    content: str  # reasoning already stripped
    tool_calls: list[dict[str, Any]]
    finish_reason: str | None
    usage: dict[str, Any]
    raw: dict[str, Any]


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.AsyncClient(
            base_url=settings.llm_gateway_base_url.rstrip("/"),
            headers={
                "Authorization": f"Bearer {settings.llm_gateway_api_key}",
                "Content-Type": "application/json",
            },
            timeout=httpx.Timeout(settings.llm_timeout_seconds),
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    @retry(
        retry=retry_if_exception_type(_RETRYABLE),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=6),
        reraise=True,
    )
    async def _post(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            resp = await self._client.post("/chat/completions", json=payload)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            # 4xx (bad request / auth) is not worth retrying; surface immediately.
            if exc.response.status_code < 500:
                logger.error(
                    "llm_client_error",
                    extra={"status": exc.response.status_code, "body": exc.response.text[:500]},
                )
                raise DependencyUnavailable(
                    f"LLM gateway rejected the request ({exc.response.status_code})."
                ) from exc
            raise

    async def chat(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str | None = None,
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str | dict | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
        highspeed: bool = False,
    ) -> ChatResult:
        s = self._settings
        chosen = model or (s.llm_highspeed_model if highspeed else s.llm_chat_model)
        payload: dict[str, Any] = {
            "model": chosen,
            "messages": messages,
            "temperature": s.llm_temperature if temperature is None else temperature,
            "max_tokens": max_tokens or s.llm_max_tokens,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = tool_choice or "auto"
        if response_format:
            payload["response_format"] = response_format

        try:
            data = await self._post(payload)
        except _RETRYABLE as exc:  # retries exhausted
            raise DependencyUnavailable("LLM gateway is unreachable.") from exc

        choice = (data.get("choices") or [{}])[0]
        message = choice.get("message", {})
        return ChatResult(
            content=strip_reasoning(message.get("content")),
            tool_calls=message.get("tool_calls") or [],
            finish_reason=choice.get("finish_reason"),
            usage=data.get("usage", {}),
            raw=data,
        )
