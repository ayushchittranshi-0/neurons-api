from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI App"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    DATABASE_URL: str = "postgresql://user:password@db:5432/fastapi_db"
    API_STR: str = "/api/"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
