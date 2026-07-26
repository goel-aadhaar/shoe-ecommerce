from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import CopilotDep
from app.schemas.chat import ChatRequest, ChatResponse, ExtractedFilters, ExtractFiltersRequest

router = APIRouter(tags=["copilot"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, copilot: CopilotDep) -> ChatResponse:
    return await copilot.chat(req)


@router.post("/extract-filters", response_model=ExtractedFilters)
async def extract_filters(req: ExtractFiltersRequest, copilot: CopilotDep) -> ExtractedFilters:
    return await copilot.extract_filters(req)
