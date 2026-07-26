from __future__ import annotations

from pydantic import BaseModel, Field


class FunnelStage(BaseModel):
    stage: str
    count: int


class TopProduct(BaseModel):
    productId: str
    name: str | None = None
    brand: str | None = None
    thumbnail: str | None = None
    price: float | None = None
    score: float
    views: int = 0
    carts: int = 0
    purchases: int = 0


class DayPoint(BaseModel):
    day: str
    total: int
    counts: dict[str, int] = Field(default_factory=dict)


class SearchTerm(BaseModel):
    query: str
    count: int


class Rates(BaseModel):
    ctr: float
    cartRate: float
    conversionRate: float


class Engagement(BaseModel):
    events: int = 0
    uniqueUsers: int = 0
    uniqueSessions: int = 0


class CopilotUsage(BaseModel):
    sessions: int = 0
    messages: int = 0


class AnalyticsSummary(BaseModel):
    windowDays: int
    generatedAt: str
    modelVersion: str | None = None
    engagement: Engagement
    rates: Rates
    funnel: list[FunnelStage]
    topProducts: list[TopProduct]
    topSearches: list[SearchTerm]
    daily: list[DayPoint]
    copilot: CopilotUsage
