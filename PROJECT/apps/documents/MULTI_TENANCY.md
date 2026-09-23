# Multi-Tenancy

Each company (tenant) is fully isolated from every other company. Within a company, each department (domain) maintains its own knowledge base, AI agent, roles, and document workflows — all powered by shared infrastructure.

## Tenant vs Domain

- **Tenant**: A company / organisation (e.g., Acme Corp)
- **Domain**: A department / business function (e.g., HR, Finance)

## Isolation Strategy

- **Network**: NGINX subdomain routing
- **Application**: JWT tenant_id claim checked in middleware
- **API**: FastAPI tenant context injected into every DB session
- **Database**: PostgreSQL Row-Level Security on all tables
