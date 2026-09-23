# Project Deployment & Standalone Service Execution

The project supports standalone service execution for both the **Web Frontend** (`apps/nexus` or `apps/web`) and **Core API Backend** (`apps/api`).

## Native Service Architecture

### 1. Web Frontend (`PROJECT/apps/nexus`)
- Next.js 15 App Router running on Node 20+
- `apps/nexus/.env` — Web frontend environment variables

### 2. Core API Backend Infrastructure (`PROJECT/apps/api`)
- Docker Compose for infrastructure dependencies:
  - PostgreSQL 16 with `pgvector` extension (`pgvector/pgvector:pg16`)
  - Redis cache & broker (`redis:7-alpine`)
  - MinIO Object Storage (`minio/minio:latest`)
  - Keycloak Identity Server (`quay.io/keycloak/keycloak:24.0`)
  - FastAPI backend container (`Dockerfile`)

## Execution Commands

### Core API Infrastructure & Backend (Docker)
```bash
cd PROJECT/apps/api
docker-compose up --build -d
```

### Web Frontend (Native Dev)
```bash
cd PROJECT/apps/nexus
npm install
npm run dev
```

