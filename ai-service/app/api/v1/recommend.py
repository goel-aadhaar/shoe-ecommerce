from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import RecommenderDep
from app.schemas.recommend import (
    HomeResponse,
    RecommendRequest,
    RecommendResponse,
    RerankRequest,
    RerankResponse,
)

router = APIRouter(tags=["recommend"])


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest, rec: RecommenderDep) -> RecommendResponse:
    return await rec.recommend(req)


@router.get("/home/{user_id}", response_model=HomeResponse)
async def home(user_id: str, rec: RecommenderDep, limit: int = Query(10, ge=1, le=30)) -> HomeResponse:
    uid = None if user_id in {"anon", "guest"} else user_id
    return await rec.home(uid, limit=limit)


@router.post("/rerank", response_model=RerankResponse)
async def rerank(req: RerankRequest, rec: RecommenderDep) -> RerankResponse:
    return await rec.rerank(req)
