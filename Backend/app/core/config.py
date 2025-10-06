from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="app/.env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Full Stack Boilerplate"
    environment: str = "development"

    backend_cors_origins: List[str] | str = ["*"]

    cors_allow_credentials: bool = True

    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@db:5432/postgres"
    )

    redis_url: str | None = "redis://redis:6379/0"

    access_token_expire_minutes: int = 15
    refresh_token_expire_minutes: int = 60 * 24 * 7

    jwt_secret_key: str = "change-me"
    jwt_refresh_secret_key: str = "change-me-refresh"
    jwt_algorithm: str = "HS256"

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: List[str] | str) -> List[str]:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
