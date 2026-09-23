import os
from typing import List, Union, Optional
from dotenv import load_dotenv, find_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings

dotenv_path = find_dotenv(usecwd=True)
if not dotenv_path:
    dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")

load_dotenv(dotenv_path=dotenv_path, override=True)


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = os.getenv("APP_NAME", "NexusRAG Multi-Domain Enterprise Platform")
    APP_VERSION: str = os.getenv("APP_VERSION", "2.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    # Tenant Subdomain & Base Domain Routing Configuration
    TENANT_BASE_DOMAIN: str = os.getenv("TENANT_BASE_DOMAIN", "localfix.app")
    PLATFORM_DOMAIN: str = os.getenv("PLATFORM_DOMAIN", os.getenv("TENANT_BASE_DOMAIN", "localfix.app"))

    # Platform SuperAdmin Credentials (.env Seed Config - No Hardcoded Secrets)
    SUPERADMIN_EMAIL: str = os.getenv("SUPERADMIN_EMAIL", "admin@nexusrag.com")
    SUPERADMIN_PASSWORD: str = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin_123")
    SUPERADMIN_NAME: str = os.getenv("SUPERADMIN_NAME", "Platform SuperAdmin")
    
    # Database Settings (PostgreSQL + pgvector)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "nexusrag_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql+asyncpg://{os.getenv('POSTGRES_USER', 'postgres')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'nexusrag_db')}"
    )
    SYNC_DATABASE_URL: str = os.getenv(
        "SYNC_DATABASE_URL",
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'nexusrag_db')}"
    )
    VECTOR_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "1536"))
    
    # Redis & Celery Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
    CELERY_TASK_SERIALIZER: str = os.getenv("CELERY_TASK_SERIALIZER", "json")
    CELERY_RESULT_SERIALIZER: str = os.getenv("CELERY_RESULT_SERIALIZER", "json")
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = int(os.getenv("CELERY_TASK_TIME_LIMIT", "3600"))
    CELERY_TASK_SOFT_TIME_LIMIT: int = int(os.getenv("CELERY_TASK_SOFT_TIME_LIMIT", "3300"))
    CELERY_WORKER_CONCURRENCY: int = int(os.getenv("CELERY_WORKER_CONCURRENCY", "4"))
    
    # Neo4j GraphRAG Settings
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123")
    
    # File Storage Abstraction (local | minio | s3)
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    STORAGE_LOCAL_PATH: str = os.getenv("STORAGE_LOCAL_PATH", "./storage")
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "minio_admin")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "minio_password123")
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "nexusrag-documents")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    
    # Vector DB Abstraction (chroma | pgvector)
    VECTOR_STORE_PROVIDER: str = os.getenv("VECTOR_STORE_PROVIDER", "pgvector")
    
    # JWT & Native Auth Settings (Zero Keycloak)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "nexus_enterprise_super_secret_jwt_key_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # LLM Provider Defaults & Keys
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "ollama")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    OLLAMA_EMBEDDING_MODEL: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

    # Pure Vector RAG Hyperparameters
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))
    RAG_CHUNK_SIZE: int = int(os.getenv("RAG_CHUNK_SIZE", "500"))
    RAG_CHUNK_OVERLAP: int = int(os.getenv("RAG_CHUNK_OVERLAP", "50"))

    # CORS Settings
    CORS_ORIGINS: Union[List[str], str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
