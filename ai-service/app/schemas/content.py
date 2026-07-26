from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import ProductOut, ScoredProduct


# --- Product comparison ---
class CompareRequest(BaseModel):
    productIds: list[str] = Field(..., min_length=2, max_length=5)


class ComparisonFacet(BaseModel):
    productId: str
    pros: list[str]
    cons: list[str]
    comfort: str | None = None
    durability: str | None = None
    valueForMoney: str | None = None
    bestFor: str | None = None


class CompareResponse(BaseModel):
    products: list[ProductOut]
    facets: list[ComparisonFacet]
    recommendation: str


# --- Review summarization ---
class SummarizeReviewsRequest(BaseModel):
    productId: str


class ReviewSummary(BaseModel):
    productId: str
    lovedFeatures: list[str]
    commonComplaints: list[str]
    overallSentiment: str
    shouldYouBuy: str
    reviewsAnalyzed: int


# --- Bundles ---
class BundlesRequest(BaseModel):
    productId: str
    cart: list[str] = Field(default_factory=list)
    limit: int = Field(default=6, ge=1, le=20)


class BundlesResponse(BaseModel):
    anchorProductId: str
    complements: list[ScoredProduct]


# --- RAG ---
class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=800)
    productId: str | None = None


class Citation(BaseModel):
    source: str
    title: str | None = None
    productId: str | None = None


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    grounded: bool
