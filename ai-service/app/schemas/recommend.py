from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.common import ScoredProduct


class HomeSection(str, Enum):
    recommended_for_you = "recommended_for_you"
    continue_shopping = "continue_shopping"
    frequently_bought_together = "frequently_bought_together"
    customers_also_bought = "customers_also_bought"
    trending = "trending"
    recently_viewed = "recently_viewed"
    based_on_your_style = "based_on_your_style"
    new_arrivals = "new_arrivals"


class RecommendRequest(BaseModel):
    userId: str | None = None
    section: HomeSection = HomeSection.recommended_for_you
    context: dict = Field(default_factory=dict)
    limit: int = Field(default=12, ge=1, le=50)


class RecommendResponse(BaseModel):
    section: HomeSection
    items: list[ScoredProduct]
    modelVersion: str


class SectionBlock(BaseModel):
    section: HomeSection
    title: str
    items: list[ScoredProduct]


class HomeResponse(BaseModel):
    userId: str | None
    sections: list[SectionBlock]


class RerankRequest(BaseModel):
    userId: str | None = None
    productIds: list[str] = Field(..., min_length=1)
    context: dict = Field(default_factory=dict)


class RerankResponse(BaseModel):
    items: list[ScoredProduct]
