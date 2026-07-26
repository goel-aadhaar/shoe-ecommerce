from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import ScoredProduct


class SearchFilters(BaseModel):
    category: str | None = None
    brand: str | None = None
    colour: str | None = None
    gender: str | None = None
    minPrice: float | None = None
    maxPrice: float | None = None
    inStock: bool | None = None


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=400)
    filters: SearchFilters | None = None
    userId: str | None = None
    limit: int = Field(default=12, ge=1, le=50)


class SimilarProductsRequest(BaseModel):
    productId: str
    limit: int = Field(default=8, ge=1, le=50)


class SearchResponse(BaseModel):
    query: str
    results: list[ScoredProduct]
    count: int
