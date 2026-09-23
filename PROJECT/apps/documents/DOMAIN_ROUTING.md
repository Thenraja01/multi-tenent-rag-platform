# Domain & Public Page Routing

Organization-level domains/workspaces are routed using subdomains and path-based fallbacks.

## Public Marketing & Auth Routes (Root Domain)

- `/` — Platform Homepage & Vector Sandbox
- `/platform` — Architectural Deep Dive & Developer Sandbox
- `/pricing` & `/price` — Tiered Pricing & Feature Matrix
- `/about` — Platform Mission & Security Pillars
- `/login` — Email + Password and Keycloak Enterprise SSO Auth
- `/register` — New Tenant Self-Signup & Workspace Provisioning
- `/forgot-password` — Password Reset Email Link Dispatch
- `/reset-password` — Token-Authenticated Password Reset Form
- `/invite/[token]` — Accept Tenant Invitation Link
- `/404` — Page / Vector Chunk Not Found
- `/403` — Access Denied / Tenant Domain Restriction

## Tenant Workspace Subdomain Routing Example

- `rag-platform.io` (Root Public Platform & Marketing Pages)
- `acme.rag-platform.io` (Acme Corporation Tenant Workspace)
- `acme.hr.rag-platform.io` or `/acme/hr/chat` (Acme HR Domain Knowledge Space)
- `acme.finance.rag-platform.io` or `/acme/finance/chat` (Acme Finance Domain Knowledge Space)

## Tenant Resolver Middleware

Resolves organization tenant slug and domain information from incoming hostnames or fallback path parameters while keeping public marketing routes accessible.
