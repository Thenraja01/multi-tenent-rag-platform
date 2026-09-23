# NexusRAG — Backend Architecture & System Blueprint

NexusRAG is a configuration-driven, multi-tenant Enterprise Retrieval-Augmented Generation (RAG) platform with strict ACL pre-filtering, dynamic RBAC, hybrid vector search (`pgvector`), and scalable async background pipelines.

---

## 🏛️ Comprehensive Architectural Taxonomy

```text
NexusRAG Backend
│
├── 1. Core Platform Layer
│   │
│   ├── API Gateway
│   │   ├── FastAPI Asynchronous Application
│   │   ├── Request Lifecycle & Security Headers
│   │   ├── API Versioning (/api/v1)
│   │   ├── Interactive OpenAPI Documentation (/docs)
│   │   └── Global Error Handling
│   │
│   ├── Security Platform
│   │   ├── Authentication (JWT HS256/RS256, Keycloak SSO)
│   │   ├── Authorization Engine (Org -> Pack -> Domain -> Module -> Role -> Permission)
│   │   └── Tenant Isolation (Subdomain Resolution, Context Injection, Query Scoping)
│   │
│   ├── Platform Services
│   │   ├── User & Profile Management
│   │   ├── Organization & Subdomain Provisioning
│   │   ├── Role & Fine-Grained Permission Management
│   │   ├── Audit Logging & Telemetry
│   │   └── Pack Licensing & Feature Gates
│   │
│   └── Common Infrastructure
│       ├── PostgreSQL Connection Pool (SQLAlchemy 2.0 Async)
│       ├── Redis Service (Cache, Rate Limiting, Celery Broker)
│       ├── Storage Service (Local / MinIO S3 Abstraction)
│       └── System Seeder & Migration Bootstrap
│
├── 2. RAG Platform Layer
│   │
│   ├── Document Intelligence Pipeline
│   │   ├── Multi-Format Ingestion (PDF, DOCX, XLSX, TXT, CSV)
│   │   ├── Structured Text Extraction & Parsing
│   │   ├── Semantic Chunking with Sliding Overlap
│   │   └── Metadata & Page-Number Enrichment
│   │
│   ├── Embedding Engine
│   │   ├── 1536-Dimensional Normalized Vector Generation
│   │   ├── Ollama Local Embeddings (`nomic-embed-text`)
│   │   └── Deterministic Embedding Fallback Engine
│   │
│   ├── Retrieval Engine
│   │   ├── Hybrid Retrieval (Vector Similarity + Lexical Fallback)
│   │   ├── Zero-Trust Secure Retrieval (Pre-Filtered Document ACLs)
│   │   └── Context Assembly & Excerpt Ranking
│   │
│   ├── Generation Engine
│   │   ├── Ollama Local LLM (`llama3.2`) & Cloud LLM Routing
│   │   ├── Prompt Engineering & Source Injection
│   │   ├── Grounded Citation Tracking
│   │   └── Hallucination Guardrails
│   │
│   └── RAG Governance
│       ├── Query Latency & Token Telemetry
│       ├── Grounded Source Audit Records (`rag_queries`, `rag_query_sources`)
│       └── Compliance & Access Auditing
│
├── 3. Business Module Layer
│   │
│   ├── Finance Module (`/api/v1/finance`)
│   │   ├── Financial Knowledge Base & Statements
│   │   ├── General Ledger & Chart of Accounts
│   │   └── Financial RAG Workflows
│   │
│   ├── HR & People Operations (`/api/v1/hr`)
│   │   ├── Employee Directory & Onboarding
│   │   ├── Attendance Tracking & Geofence Verification
│   │   ├── Leave Requests & Approval Workflows
│   │   └── HR Policy Assistant
│   │
│   ├── Legal & Compliance (`/api/v1/legal`)
│   │   ├── Contract & NDA Repository
│   │   ├── Automated Legal Clause Review & Risk Assessment
│   │   └── Regulatory Compliance Search
│   │
│   ├── Operations Module (`/api/v1/operations`)
│   │   ├── Standard Operating Procedures (SOPs) Catalog
│   │   └── Operational Runbook Assistant
│   │
│   └── Custom Domain Workflows (`/api/v1/domains`)
│       ├── Dynamic Domain Registration (IT, Support, Sales)
│       └── Isolated Knowledge Stores
│
├── 4. Data Platform Layer
│   │
│   ├── PostgreSQL 16 (`pgvector`)
│   │   ├── Relational Schemas (Tenants, Users, Roles, Documents)
│   │   └── 1536-Dimensional Embeddings with Cosine Distance
│   │
│   ├── Redis 7
│   │   ├── In-Memory Caching & Session Store
│   │   ├── Sliding-Window API Rate Limiting
│   │   └── Celery Task Broker & Result Backend
│   │
│   └── Object Storage (MinIO S3)
│       └── Secure Raw File Storage (PDFs, Spreadsheets, Docs)
│
└── 5. Deployment Platform
    ├── Docker Compose Multi-Container Stack
    ├── Asynchronous Celery Workers
    └── Dynamic CORS & Security Hardening
```

---

## 🔄 Simplified System Flows

### 1. User Request & RAG Inference Flow
```text
User Request
     │
     ▼
FastAPI Gateway (Port 8000 / /api/v1)
     │
     ▼
Core Platform
 ├── Authentication (JWT Bearer Token)
 ├── Tenant Isolation (Subdomain / Header Context)
 └── Dynamic RBAC (Permissions Check)
     │
     ▼
Business Modules (/finance, /hr, /legal, /operations)
     │
     ▼
Secure RAG Platform
 ├── Query Understanding & Vector Embedding
 ├── Access Control Check (Pre-filtering authorized document IDs)
 ├── Hybrid Search (pgvector cosine similarity)
 ├── Context Builder & Optimization
 └── LLM Processing (Ollama / Cloud Provider)
     │
     ▼
Grounded AI Response (With precise citations & page numbers)
```

---

### 2. Document Ingestion & Vector Processing Data Flow
```text
Physical Document (PDF, DOCX, XLSX, TXT)
     │
     ▼
Upload Service (/api/v1/documents/upload)
     │
     ▼
Document Processing Pipeline
 ├── 1. Extract Structured Text (pypdf / python-docx / openpyxl)
 ├── 2. Create Semantic Overlapping Chunks (500 chars / 50 overlap)
 └── 3. Generate 1536-dim Embeddings (Ollama nomic-embed-text)
     │
     ▼
PostgreSQL 16 + pgvector (Persist Document, DocumentChunks, and Embeddings)
     │
     ▼
Secure Retrieval Engine (Strict ACL match on Document.id)
     │
     ▼
LLM Context Window (Prompt assembly with source references)
     │
     ▼
Grounded AI Answer + Audit Log
```

---

## 🛠️ Implemented API Endpoints Catalog

| Endpoint Prefix | Layer / Business Module | Key Operations |
| :--- | :--- | :--- |
| `/api/v1/auth` | Core Platform: Auth | Login, Register, Profile, Token Refresh, Password Management |
| `/api/v1/organizations` | Core Platform: Tenancy | Org lifecycle, Subdomain config, Tenant isolation |
| `/api/v1/users` | Core Platform: Users | User provisioning, role assignments, department mappings |
| `/api/v1/roles` & `/permissions` | Core Platform: RBAC | Dynamic roles, atomic permissions, module bindings |
| `/api/v1/packs` & `/modules` | Core Platform: Licensing | Enterprise pack subscriptions and module activation |
| `/api/v1/documents` | RAG Platform: Ingestion | Multi-format upload, text extraction, chunking, embeddings |
| `/api/v1/knowledge` | RAG Platform: Engine | `/query` — Zero-trust RAG retrieval with citations |
| `/api/v1/finance` | Business Module: Finance | Ledger accounts, journal entries, balance sheets, finance RAG |
| `/api/v1/hr` | Business Module: HR | Employee directory, check-in attendance, leave workflows |
| `/api/v1/legal` | Business Module: Legal | Contract catalog, automated AI clause review & risk audit |
| `/api/v1/operations` | Business Module: Ops | SOPs catalog, operational runbook guidance assistant |
| `/api/v1/audit` | Governance | System event logging, compliance trail, token telemetry |
| `/api/v1/health` | Infrastructure | Service health check (Database, Redis, Storage) |
