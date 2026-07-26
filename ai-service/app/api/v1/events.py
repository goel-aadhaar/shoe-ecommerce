from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import AnalyticsDep
from app.schemas.events import EventAck, EventIn

router = APIRouter(tags=["events"])


@router.post("/events", response_model=EventAck, status_code=status.HTTP_202_ACCEPTED)
async def ingest_event(event: EventIn, analytics: AnalyticsDep) -> EventAck:
    """Ingest a behavioural event. Feeds CF, ranking, and analytics."""
    return await analytics.record_event(event)
