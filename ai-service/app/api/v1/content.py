from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import ContentDep, RagDep
from app.schemas.content import (
    AskRequest,
    AskResponse,
    BundlesRequest,
    BundlesResponse,
    CompareRequest,
    CompareResponse,
    ReviewSummary,
    SummarizeReviewsRequest,
)

router = APIRouter(tags=["content"])


@router.post("/compare-products", response_model=CompareResponse)
async def compare_products(req: CompareRequest, content: ContentDep) -> CompareResponse:
    return await content.compare(req)


@router.post("/summarize-reviews", response_model=ReviewSummary)
async def summarize_reviews(req: SummarizeReviewsRequest, content: ContentDep) -> ReviewSummary:
    return await content.summarize_reviews(req)


@router.post("/bundles", response_model=BundlesResponse)
async def bundles(req: BundlesRequest, content: ContentDep) -> BundlesResponse:
    return await content.bundles(req)


@router.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest, rag: RagDep) -> AskResponse:
    return await rag.ask(req)
