from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database: mysql+pymysql://USER:PASSWORD@HOST:3306/DATABASE
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/rhumatoai"

    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Comma-separated origins, e.g. http://rheuma.local,http://localhost:3000
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:19006"

    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma4:e4b"

    # development | production
    APP_ENV: str = "development"

    # When true, SQLAlchemy create_all runs on startup (use migrations in production)
    CREATE_TABLES_ON_STARTUP: bool | None = None

    @field_validator("OLLAMA_HOST", mode="before")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/") if isinstance(v, str) else v

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def create_tables_on_startup(self) -> bool:
        if self.CREATE_TABLES_ON_STARTUP is not None:
            return self.CREATE_TABLES_ON_STARTUP
        return not self.is_production


settings = Settings()
