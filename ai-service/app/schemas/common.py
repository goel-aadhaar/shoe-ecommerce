"""Shared response models."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: str
    name: str | None = None
    brand: str | None = None
    price: float | None = None
    gender: str | None = None
    color: str | None = None
    thumbnail: str | None = None
    rating: float | None = None
    category: str | None = None


class ScoredProduct(ProductOut):
    score: float = Field(..., description="Relevance / ranking score in [0, 1]-ish range")
    reason: str | None = Field(default=None, description="Human-readable why-recommended")


class HealthOut(BaseModel):
    status: str = "ok"
    service: str = "urban-sole-ai"
    version: str


class ReadyOut(BaseModel):
    ready: bool
    dependencies: dict[str, bool]
