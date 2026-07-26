"""Centralised configuration via Pydantic Settings.

All configuration comes from the environment (12-factor). Values are validated
once at startup and injected everywhere through the DI container — no module
reaches into ``os.environ`` directly.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_SERVICE_TOKEN = "change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    app_name: str = "urban-sole-ai"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = True
    log_level: str = "INFO"
    api_v1_prefix: str = "/v1"

    # --- Service-to-service auth ---
    service_token: str = INSECURE_SERVICE_TOKEN

    # --- MongoDB ---
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "urban_sole"

    # --- Qdrant ---
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None
    qdrant_products_collection: str = "products"
    qdrant_knowledge_collection: str = "knowledge"

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"

    # --- LLM gateway (OpenAI-compatible) ---
    llm_gateway_base_url: str = "https://llm-gateway-azure.penpencil.guru/v1"
    llm_gateway_api_key: str = ""
    llm_chat_model: str = "MiniMax-M2.5"
    llm_highspeed_model: str = "MiniMax-M2.5-highspeed"
    llm_timeout_seconds: int = 60
    llm_max_tokens: int = 1024
    llm_temperature: float = 0.3

    # --- Embeddings ---
    embeddings_provider: Literal["sbert", "gateway", "hash"] = "sbert"
    embeddings_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings_dim: int = 384

    # --- Celery ---
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # --- Behaviour tuning ---
    cache_ttl_seconds: int = 3600
    session_ttl_seconds: int = Field(default=86400, description="Conversation memory TTL")

    # --- Recommender / ML ---
    artifacts_dir: str = "artifacts"
    rec_half_life_days: float = 14.0          # popularity time-decay
    rec_trending_window_days: int = 7
    cf_topk: int = 50                         # neighbours kept per item in item-item CF
    arm_min_support: float = 0.02             # association-rule mining
    arm_min_lift: float = 1.0

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @model_validator(mode="after")
    def _reject_insecure_production_config(self) -> "Settings":
        """Fail fast rather than run production with the placeholder token.

        The AI service is internal-only, but docker-compose publishes it on the
        host — booting with the documented default would leave it open to
        anyone who read the README.
        """
        if self.environment == "production" and self.service_token == INSECURE_SERVICE_TOKEN:
            raise ValueError(
                "SERVICE_TOKEN is still the placeholder value. Set a strong, unique "
                "token (it must match the Express AI_SERVICE_TOKEN) before running "
                "in production."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    """Cached singleton accessor. Patch ``get_settings.cache_clear()`` in tests."""
    return Settings()
