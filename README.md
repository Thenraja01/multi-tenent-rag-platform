# 🌐 NexusRAG — Enterprise Multi-Domain RAG Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**NexusRAG** is a production-grade, multi-tenant Enterprise Retrieval-Augmented Generation (RAG) platform. It provides strict Access Control List (ACL) pre-filtering, dynamic Role-Based Access Control (RBAC), multi-format document ingestion, hybrid vector search (`pgvector`), and domain-isolated knowledge engines across specialized enterprise business modules.

---

## 🏛️ Architecture Overview

```text
NexusRAG Platform
├── 1. Core Platform Layer
│   ├── API Gateway (FastAPI Async, /api/v1, OpenAPI Docs)
│   ├── Security Platform (JWT, Dynamic RBAC, Multi-Tenancy Isolation)
│   └── Platform Services (User Mgmt, Org Provisioning, Licensing & Audit)
│
├── 2. RAG Platform Layer
│   ├── Document Intelligence (PDF, DOCX, XLSX, TXT, CSV parsing & semantic chunking)
│   ├── Embedding Engine (1536-dim vector embeddings, nomic-embed-text / Ollama)
│   ├── Retrieval Engine (Zero-Trust ACL Pre-filtering, Hybrid pgvector Search)
│   └── Generation Engine (Local Ollama / Cloud LLM routing with grounded citations)
│
├── 3. Business Modules
│   ├── 👥 HR & People Operations (/api/v1/hr — policies, attendance, leave workflows)
│   ├── 💰 Finance Module (/api/v1/finance — statements, ledgers, finance RAG)
│   ├── ⚖️ Legal & Compliance (/api/v1/legal — contract repository, clause reviews)
│   └── ⚙️ Operations (/api/v1/operations — SOPs, runbook assistant)
│
├── 4. Frontend Application (apps/nexus)
│   ├── Next.js 15 App Router + TypeScript + Tailwind CSS
│   ├── Subdomain-based Dynamic Multi-Tenant Routing
│   └── Portals: Superadmin, Org-Admin, HR, Department, Employee Workspace
│
└── 5. Data & Deployment Infrastructure
    ├── PostgreSQL 16 + pgvector, Redis, MinIO S3
    └── Docker Compose & Nginx Reverse Proxy
```

---

## 📁 Repository Structure

```tree
rag_multi_domain_system/
├── PROJECT/
│   ├── apps/
│   │   ├── api/                     # FastAPI Backend Application
│   │   │   ├── app/                 # Core endpoints, models, services, auth, RAG pipelines
│   │   │   ├── migrations/          # Database migrations (Alembic)
│   │   │   ├── seed_enterprise.py   # Enterprise demo seeder script
│   │   │   ├── requirements.txt     # Python backend dependencies
│   │   │   └── Dockerfile           # Backend container definition
│   │   │
│   │   ├── nexus/                   # Next.js 15 Frontend Web Application
│   │   │   ├── app/                 # App router pages, tenant routes, dynamic auth
│   │   │   ├── components/          # Reusable UI component library
│   │   │   ├── providers/           # Context providers (Auth, Tenant, Theme)
│   │   │   ├── lib/                 # Client utilities & API clients
│   │   │   └── package.json         # Node.js dependencies
│   │   │
│   │   └── documents/               # Technical specs, architecture docs, sample datasets
│   │
│   ├── deploy/                      # Deployment manifests & Nginx configuration
│   └── storage/                     # Document storage volumes & uploads
│
├── .gitignore                       # Root Git ignore rules
└── README.md                        # Platform documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** / **pnpm**
- **PostgreSQL 16** with `pgvector` extension (or SQLite for local testing)
- **Ollama** (optional, for local LLM & embedding generation)

---

### 1. Backend Setup (`apps/api`)

1. Navigate to the API directory:
   ```bash
   cd PROJECT/apps/api
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update database URLs and secrets as needed
   ```

5. Run database seed (optional for sample tenant and users):
   ```bash
   python seed_enterprise.py
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### 2. Frontend Setup (`apps/nexus`)

1. Navigate to the frontend directory:
   ```bash
   cd PROJECT/apps/nexus
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   - Application URL: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Multi-Tenancy

- **Subdomain & Header Scoping**: Requests are automatically scoped to tenants (e.g. `globex.localfix.app` or via `X-Tenant-ID` header).
- **Strict ACL Pre-filtering**: RAG retrieval inspects tenant, department, and role permissions *before* vector distance calculations to eliminate data leakage.
- **Audit Trails**: Every RAG query records full telemetry (`rag_queries`, `rag_query_sources`), tracking execution latency, matched chunks, and grounded sources.

---

## 🛠️ API Endpoints Summary

| Endpoint Prefix | Domain / Service | Key Operations |
| :--- | :--- | :--- |
| `/api/v1/auth` | Authentication | Sign in, Token refresh, User profile, Password reset |
| `/api/v1/organizations` | Tenancy | Org lifecycle, Subdomain provisioning, Quotas |
| `/api/v1/users` | User Directory | User CRUD, Department assignment, Role assignment |
| `/api/v1/roles` | RBAC | Custom roles and atomic permissions |
| `/api/v1/documents` | Ingestion | Upload PDF/DOCX/XLSX/TXT, Semantic chunking |
| `/api/v1/knowledge` | RAG Engine | `/query` endpoint with cited document references |
| `/api/v1/hr` | People Ops | Employee directory, attendance logs, leave management |
| `/api/v1/finance` | Finance | General ledger, financial reports, finance RAG |
| `/api/v1/legal` | Legal | Contract management & automated clause risk analysis |
| `/api/v1/operations` | Operations | SOP catalog, incident runbooks |
| `/api/v1/audit` | Governance | System event logs & RAG source attribution audit |

---

## 📄 License

This project is licensed under the MIT License.
