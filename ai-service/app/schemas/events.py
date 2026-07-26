from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class EventType(str, Enum):
    view = "view"
    click = "click"
    add_to_cart = "add_to_cart"
    purchase = "purchase"
    search = "search"


class EventIn(BaseModel):
    userId: str | None = None
    sessionId: str | None = None
    type: EventType
    productId: str | None = None
    query: str | None = None
    metadata: dict = Field(default_factory=dict)


class EventAck(BaseModel):
    accepted: bool = True
