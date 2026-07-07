from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/smart_bharat"
    REDIS_URL: str = "redis://localhost:6379/0"

    GEMINI_API_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://*.netlify.app"
    TRUSTED_HOSTS: str = "localhost,127.0.0.1,.onrender.com"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def trusted_hosts_list(self) -> List[str]:
        return [host.strip() for host in self.TRUSTED_HOSTS.split(",")]


settings = Settings()
