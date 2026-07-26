from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import AnalyticsDep
from app.schemas.analytics import AnalyticsSummary

router = APIRouter(tags=["analytics"])


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    svc: AnalyticsDep, days: int = Query(30, ge=1, le=365)
) -> AnalyticsSummary:
    """Full dashboard payload: funnel, rates, top products, searches, series."""
    return await svc.summary(days=days)


@router.get("/analytics/{metric}")
async def analytics_metric(
    metric: str, svc: AnalyticsDep, days: int = Query(30, ge=1, le=365)
) -> dict:
    """Single metric: funnel · top-products · daily · top-searches · engagement."""
    return await svc.get_metric(metric, days=days)
