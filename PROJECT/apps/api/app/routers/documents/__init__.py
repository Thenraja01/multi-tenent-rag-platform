from app.routers.documents.router import (
    router,
    list_documents,
    upload_document,
    upload_multiple_documents,
    enable_ai_knowledge,
    disable_ai_knowledge,
    reprocess_knowledge,
    get_knowledge_status,
    reject_document,
)

approve_and_ingest_document = enable_ai_knowledge

__all__ = [
    "router",
    "list_documents",
    "upload_document",
    "upload_multiple_documents",
    "enable_ai_knowledge",
    "approve_and_ingest_document",
    "disable_ai_knowledge",
    "reprocess_knowledge",
    "get_knowledge_status",
    "reject_document",
]
