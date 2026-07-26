from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import SearchDep
from app.schemas.search import SearchResponse, SemanticSearchRequest, SimilarProductsRequest

router = APIRouter(tags=["search"])


@router.post("/semantic-search", response_model=SearchResponse)
async def semantic_search(req: SemanticSearchRequest, search: SearchDep) -> SearchResponse:
    return await search.semantic_search(req)


@router.post("/similar-products", response_model=SearchResponse)
async def similar_products(req: SimilarProductsRequest, search: SearchDep) -> SearchResponse:
    return await search.similar_products(req)
