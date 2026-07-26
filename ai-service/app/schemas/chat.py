from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import ScoredProduct


class ChatRequest(BaseModel):
    sessionId: str = Field(..., min_length=1)
    userId: str | None = None
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    products: list[ScoredProduct] = Field(default_factory=list)
    why: list[str] = Field(default_factory=list)
    followUp: str | None = None
    sessionId: str


class ExtractFiltersRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=400)


class ExtractedFilters(BaseModel):
    category: str | None = None
    brand: str | None = None
    colour: str | None = None
    gender: str | None = None
    minPrice: float | None = None
    maxPrice: float | None = None
    size: str | None = None
    keywords: list[str] = Field(default_factory=list)
