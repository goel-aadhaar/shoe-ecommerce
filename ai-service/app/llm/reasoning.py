"""Helpers for the gateway's MiniMax *reasoning* models.

Those models interleave a ``<think>...</think>`` chain-of-thought inside
``message.content``. It must never reach the shopper. ``strip_reasoning``
removes it; ``split_reasoning`` keeps it for logging/debugging.
"""

from __future__ import annotations

import re

_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
_OPEN_THINK_RE = re.compile(r"<think>.*", re.DOTALL | re.IGNORECASE)


def strip_reasoning(content: str | None) -> str:
    if not content:
        return ""
    cleaned = _THINK_RE.sub("", content)
    # Guard against a truncated/unclosed think block (hit token limit mid-thought).
    cleaned = _OPEN_THINK_RE.sub("", cleaned)
    return cleaned.strip()


def split_reasoning(content: str | None) -> tuple[str, str]:
    """Return (visible_answer, reasoning_text)."""
    if not content:
        return "", ""
    reasoning = " ".join(m.group(0) for m in _THINK_RE.finditer(content))
    return strip_reasoning(content), reasoning
