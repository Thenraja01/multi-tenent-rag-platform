# Vector Retrieval-Augmented Generation (RAG) Architecture

## Pure Dense Vector Retrieval Pipeline

The NexusRAG backend implements a pure dense vector retrieval engine powered by `pgvector` / `ChromaDB` (1536-dimensional embeddings):

```text
User Question
     │
     ▼
[Tenant & Domain Resolution]
     │
     ▼
[Pre-LLM Security & RBAC Checks]
     │
     ▼
[Vector Similarity Retrieval]
(pgvector / ChromaDB Cosine Distance)
     │
     ▼
[Ranked Authorized Chunks]
     │
     ▼
[Context Construction]
     │
     ▼
[Domain AI Agent]
(HR, Finance, IT, Legal, Operations)
     │
     ▼
[LLM Provider Engine]
(Ollama, Gemini, OpenAI, Groq, Claude)
     │
     ▼
[Answer + Grounded Citations]
     │
     ▼
[SSE Stream / Client UI]
```

## Security Invariants
1. **Zero Cross-Tenant Leakage**: Chunks filtered strictly by `tenant_id` at the database and vector layer.
2. **Zero Cross-Domain Leakage**: Domains (HR, Finance, IT, Legal, Operations) have independent boundaries and distinct AI Agent system prompts.
3. **Pre-LLM Role Gating**: Role-restricted documents are pruned before context synthesis.
4. **Grounded Citations**: Source document title, chunk ID, page number, and similarity score returned with every response.
