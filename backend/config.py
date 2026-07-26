import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Behavioral Anomaly Detection Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-cyber-ueba-key-2026-antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cyber_ueba.db")
    
    # ML Engine Settings
    DEFAULT_ALERT_BUDGET_PERCENTILE: float = 99.0 # Top 1% alert threshold
    MODEL_STORAGE_PATH: str = "./saved_models"
    
    class Config:
        case_sensitive = True

settings = Settings()
