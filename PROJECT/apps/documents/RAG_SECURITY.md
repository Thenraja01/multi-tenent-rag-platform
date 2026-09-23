# NexusRAG — Vector Search & RAG Security Specification

## 🛡️ Role-Gated pgvector Retrieval Pipeline

The RAG pipeline enforces security filtering **BEFORE** vector context is constructed or sent to the LLM.

```text
User Question
     ↓
Keycloak Identity
     ↓
Resolve Tenant ID
     ↓
Resolve Department ID
     ↓
Resolve User Role & Permissions
     ↓
Construct Security Filter:
  • tenant_id == current_user.tenant_id
  • visibility == "public" OR 
    (visibility == "department" AND domain_id == department_id) OR
    (visibility == "role_restricted" AND allowed_roles CONTAINS user_role)
     ↓
pgvector Cosine Distance Query
     ↓
Authorized Chunks Only
     ↓
LLM Context Synthesis
     ↓
Grounded Answer + Citations
```

---

## 🔒 Security Invariants

- **Invariant 1**: Cross-tenant vector retrieval is **ALWAYS** denied.
- **Invariant 2**: Unauthorized vector chunks are filtered out **BEFORE** LLM context construction.
- **Invariant 3**: Authorization context is derived strictly from server-side authenticated Keycloak identity & database roles—never trusted from client input.
