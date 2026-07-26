"""FastAPI dependency providers.

Routers depend on services, never on concrete repositories or clients. Each
provider pulls the singleton off the container stored on ``app.state``.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request

from app.core.container import Container
from app.services.analytics_service import AnalyticsService
from app.services.content_service import ContentService
from app.services.copilot_service import CopilotService
from app.services.rag_service import RagService
from app.services.recommender_service import RecommenderService
from app.services.search_service import SearchService


def get_container(request: Request) -> Container:
    return request.app.state.container


ContainerDep = Annotated[Container, Depends(get_container)]


def get_search(c: ContainerDep) -> SearchService:
    return c.search


def get_recommender(c: ContainerDep) -> RecommenderService:
    return c.recommender


def get_copilot(c: ContainerDep) -> CopilotService:
    return c.copilot


def get_rag(c: ContainerDep) -> RagService:
    return c.rag


def get_content(c: ContainerDep) -> ContentService:
    return c.content


def get_analytics(c: ContainerDep) -> AnalyticsService:
    return c.analytics


SearchDep = Annotated[SearchService, Depends(get_search)]
RecommenderDep = Annotated[RecommenderService, Depends(get_recommender)]
CopilotDep = Annotated[CopilotService, Depends(get_copilot)]
RagDep = Annotated[RagService, Depends(get_rag)]
ContentDep = Annotated[ContentService, Depends(get_content)]
AnalyticsDep = Annotated[AnalyticsService, Depends(get_analytics)]
