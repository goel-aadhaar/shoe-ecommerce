"""Celery application + beat schedule.

Runs the offline/precompute work off the request path: re-embedding changed
products, (later) model training, popularity/bundle precompute, analytics
rollups. Broker + result backend are Redis.
"""

from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery = Celery(
    "urban_sole_ai",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks"],
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_acks_late=True,
    worker_max_tasks_per_child=100,
    task_default_retry_delay=30,
)

# Precompute schedule (tasks are safe no-ops until their feature phase lands).
celery.conf.beat_schedule = {
    "reindex-catalog-nightly": {
        "task": "app.workers.tasks.reindex_catalog_task",
        "schedule": crontab(hour="3", minute="0"),
    },
    "ingest-knowledge-nightly": {
        "task": "app.workers.tasks.ingest_knowledge_task",
        "schedule": crontab(hour="3", minute="30"),
    },
    "train-models-nightly": {
        "task": "app.workers.tasks.train_models_task",
        "schedule": crontab(hour="4", minute="0"),
    },
    "rollup-analytics-hourly": {
        "task": "app.workers.tasks.compute_rollups_task",
        "schedule": crontab(minute="0"),
    },
}
