# NexusRAG — Database Architecture & ERD Specification

Primary Database: **PostgreSQL 16** with **pgvector** extension.
Secondary Datastores: **ChromaDB**, **Redis** (Cache/Broker).

Interactive Visual ERD Diagram: [database_diagram.html](file:///d:/projects/rag_multi_domain_system/documents/database_diagram.html)  
Live Web Endpoint: [http://localhost:8000/static/database_diagram.html](http://localhost:8000/static/database_diagram.html)

---

## 🗄️ Core Tables & Relationships

### 1. `tenants`
Stores organization accounts, SuperAdmin approval lifecycle status (`pending`, `approved`, `suspended`, `rejected`), and assigned subdomains.
- **PK**: `id` (UUID)
- **Key Columns**: `name`, `subdomain`, `org_email`, `admin_name`, `admin_email`, `status`

### 2. `domains` & `tenant_domains`
Stores business domain catalog (HR, Finance, IT, Legal, Operations) and tenant activation state with independent JSON configs.
- **PK**: `id` (UUID)
- **Key Columns**: `name`, `slug` (UNIQUE), `configuration` (JSON RAG & LLM settings)

### 3. `users` & `user_roles`
Identity and membership table mapping users to tenant and domain roles.
- **PK**: `id` (UUID)

### 4. `roles` & `permissions`
Database-driven dynamic RBAC table storing fine-grained atomic permissions.

### 5. `documents` & `document_chunks`
Physical document registry and pgvector storage table for 1536-dimensional embeddings, chunk text, and role visibility tags.

### 6. `conversations`, `messages` & `message_sources`
Multi-tenant conversational sessions, message records, and grounded citation sources.

### 7. `usage_records` & `audit_logs`
Tracks token consumption, API telemetry, vector search metrics, and security audit events.
