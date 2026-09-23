# FastAPI Core Architecture & Endpoint Registry

Location: `PROJECT/apps/api` (FastAPI Server with Docker, PostgreSQL `pgvector`, Redis, MinIO/S3, Chroma & Keycloak)

## File Structure

```text
apps/api/
├── .env                       # Environment variables configuration file
├── .env.example               # Environment variables example template
├── Dockerfile                 # Docker container build file
├── docker-compose.yml         # Containerized Postgres, Keycloak, Redis, MinIO, Chroma & API
├── venv/                      # Python virtual environment (Python 3.14)
├── requirements.txt           # FastAPI, SQLAlchemy, pgvector, asyncpg, Keycloak, pytest
├── main.py                    # Root Uvicorn server launcher
└── app/                       # Application Package
    ├── main.py                # FastAPI app factory, CORS, static routes, /api/v1 router
    ├── config/                # Settings & env config (SettingsConfigDict loading .env)
    ├── core/                  # Provider Abstractions
    │   ├── storage/           # StorageProvider (Local, MinIO/S3)
    │   ├── llm/               # LLMProvider (Ollama, Gemini, OpenAI, Groq, Claude)
    │   ├── vector/            # VectorStore (PgVector, ChromaDB)
    │   ├── search/            # BM25 Keyword Search & Hybrid RRF Reranker
    │   └── agents/            # Domain AI Agents (HR, Finance, IT, Legal, Operations)
    ├── middleware/            # Tenant resolution, Keycloak OIDC JWT auth, CORS
    ├── controllers/           # Root & Legacy API Routers (/auth, /tenants, /users, etc.)
    │   └── v1/                # Versioned APIs (/api/v1/ai, /documents, /knowledge, /domains, /conversations, /audit, /usage)
    ├── services/              # Ingestion pipeline, Hybrid RAG service, Document parser, Chunking
    ├── models/                # SQLAlchemy ORM models (Tenant, Domain, Document, DocumentChunk, Conversation, Message, Usage)
    ├── validation/            # Pydantic request/response validation schemas
    ├── modules/               # Keycloak integration, pgvector manager, RAG pipeline
    ├── utils/                 # Security, JWT helpers, Logger, Chunking utilities
    └── public/                # Public API status dashboard (index.html)
```

## API Endpoint Routes

### Core Versioned Platform APIs (`/api/v1/*`)
- **AI & RAG**: `POST /api/v1/ai/chat` (Hybrid RAG with grounded citations), `POST /api/v1/ai/stream` (Real-time SSE token stream)
- **Domains Registry**: `GET /api/v1/domains`, `POST /api/v1/domains`, `GET /api/v1/domains/{id}`, `PATCH /api/v1/domains/{id}`
- **Documents Pipeline**: `POST /api/v1/documents/upload`, `GET /api/v1/documents`, `GET /api/v1/documents/{id}`, `DELETE /api/v1/documents/{id}`
- **Knowledge Base**: `GET /api/v1/knowledge`, `GET /api/v1/knowledge/chunks`, `POST /api/v1/knowledge/reindex`
- **Conversations**: `GET /api/v1/conversations`, `POST /api/v1/conversations`, `GET /api/v1/conversations/{id}`, `DELETE /api/v1/conversations/{id}`
- **Audit Logging**: `GET /api/v1/audit`
- **Usage & Quotas**: `GET /api/v1/usage`, `GET /api/v1/usage/ai`
- **System Health**: `GET /health`, `GET /health/ready`, `GET /health/live`, `GET /docs` (Swagger UI)
