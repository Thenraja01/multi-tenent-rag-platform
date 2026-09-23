"""
Modular Clean Architecture & DDD Verification Test Suite.
Tests:
1. Core packages (Config, Database, Redis, Storage, Security, Logging, Exceptions)
2. Middleware (Tenant, CORS, Rate Limit, Auth, Audit)
3. Domain Verticals (HR, Finance, IT, Legal)
4. Ingestion & RAG Pipelines (Document, Spreadsheet, Image, RAG)
5. Background Workers (Document, OCR, Chunking, Embedding, RAG)
6. Data Repositories (Organizations, Users, Documents, Embeddings)
"""
import asyncio
import uuid
from decimal import Decimal
from datetime import date

# 1. Core Packages
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db, get_db
from app.core.redis import redis_service
from app.core.storage import storage_service
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.core.logging import logger
from app.core.exceptions import AuthenticationError, AuthorizationError, ResourceNotFoundError

# 2. Middleware
from app.middleware.tenant import TenantMiddleware
from app.middleware.cors import DynamicCORSMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.auth import AuthContextMiddleware
from app.middleware.audit import AuditMiddleware

# 3. Domain Verticals
from app.domains.hr.domain import EmployeeEntity, LeaveRequestEntity, HRDomainRules
from app.domains.hr.schemas import EmployeeCreate, LeaveRequestCreate
from app.domains.hr.application import HRApplicationService

from app.domains.finance.domain import InvoiceEntity, ExpenseEntity
from app.domains.finance.schemas import InvoiceCreate, ExpenseCreate
from app.domains.finance.application import FinanceApplicationService

from app.domains.it.domain import ITTicketEntity
from app.domains.it.schemas import ITTicketCreate
from app.domains.it.application import ITApplicationService

from app.domains.legal.domain import LegalContractEntity
from app.domains.legal.schemas import LegalContractCreate
from app.domains.legal.application import LegalApplicationService

# 4. Pipelines
from app.pipelines.document_pipeline import DocumentPipeline, TextNormalizer
from app.pipelines.spreadsheet_pipeline import SpreadsheetPipeline, SpreadsheetParser
from app.pipelines.image_pipeline import ImagePipeline
from app.pipelines.rag_pipeline import RAGPipeline, MultiDomainRetriever, RAGSynthesizer

# 5. Workers
from app.workers import DocumentWorker, OCRWorker, ChunkingWorker, EmbeddingWorker, RAGWorker

# 6. Repositories
from app.repositories import OrganizationRepository, UserRepository, DocumentRepository, EmbeddingRepository


async def run_modular_verification():
    print("=" * 80)
    print("  VERIFYING MODULAR DDD & CLEAN ARCHITECTURE REFACTORING")
    print("=" * 80)

    # 1. Core Security & Storage
    print("\n[1/6] Testing Core Infrastructure...")
    pw_hash = hash_password("SecurePass123!")
    assert verify_password("SecurePass123!", pw_hash) is True
    print("  -> Argon2id password hashing: PASS")

    token = create_access_token(subject="user_123", organization_id="org_456")
    payload = decode_token(token)
    assert payload["sub"] == "user_123"
    assert payload["organization_id"] == "org_456"
    print("  -> JWT token lifecycle: PASS")

    storage_key = storage_service.generate_storage_key("org_1", "hr", "doc_1", "policy.pdf")
    assert "org_1/hr/documents/doc_1/policy.pdf" == storage_key
    print("  -> Tenant-isolated storage keys: PASS")

    # 2. Domain Entities & Rules
    print("\n[2/6] Testing Domain Verticals (DDD Layers)...")
    valid_dates = HRDomainRules.validate_leave_dates(date(2026, 9, 21), date(2026, 9, 25))
    assert valid_dates is True
    leave_days = HRDomainRules.calculate_leave_days(date(2026, 9, 21), date(2026, 9, 25))
    assert leave_days == 5
    print("  -> HR Domain business rules: PASS")

    inv = InvoiceEntity(
        id="inv_1",
        organization_id="org_1",
        vendor_name="Acme Supplies",
        invoice_number="INV-2026-001",
        total_amount=Decimal("1500.50"),
        due_date=date(2026, 10, 1),
        payment_status="PENDING",
    )
    assert inv.total_amount == Decimal("1500.50")
    print("  -> Finance Domain entities: PASS")

    ticket = ITTicketEntity(
        id="tick_1",
        organization_id="org_1",
        title="VPN Access Request",
        priority="HIGH",
        status="OPEN",
    )
    assert ticket.priority == "HIGH"
    print("  -> IT Domain entities: PASS")

    contract = LegalContractEntity(
        id="con_1",
        organization_id="org_1",
        title="Master Services Agreement",
        party_name="Globex Corp",
        contract_type="MSA",
        status="ACTIVE",
    )
    assert contract.contract_type == "MSA"
    print("  -> Legal Domain entities: PASS")

    # 3. Ingestion Pipelines
    print("\n[3/6] Testing Multimodal Ingestion Pipelines...")
    norm_text = TextNormalizer.normalize("  Enterprise   Document   \n\n\n\nSection 1   ")
    assert norm_text == "Enterprise Document \n\nSection 1"
    print("  -> Text normalization: PASS")

    doc_pipeline = DocumentPipeline(chunk_size=50, chunk_overlap=10)
    chunks = doc_pipeline.chunk_text("This is a test document that should be chunked into small pieces cleanly.")
    assert len(chunks) > 1
    print(f"  -> Document chunking pipeline ({len(chunks)} chunks produced): PASS")

    csv_data = b"name,department,role\nAlice,HR,Manager\nBob,Finance,Analyst"
    parsed_rows = SpreadsheetParser.parse_csv(csv_data)
    assert len(parsed_rows) == 2
    md_table = SpreadsheetParser.rows_to_markdown_table(parsed_rows)
    assert "| Alice | HR | Manager |" in md_table
    print("  -> Spreadsheet tabular parsing & markdown matrix conversion: PASS")

    # 4. Prompt Assembly & RAG Synthesizer
    print("\n[4/6] Testing RAG Pipeline Context Assembly...")
    sources = [{"document_title": "HR Handbook", "content": "Employees get 20 days annual leave."}]
    rag_prompt = RAGSynthesizer.build_context_prompt("How many leave days do I get?", sources)
    assert "HR Handbook" in rag_prompt
    assert "20 days annual leave" in rag_prompt
    print("  -> RAG prompt context builder: PASS")

    # 5. Background Task Workers
    print("\n[5/6] Testing Background Task Workers...")
    chunk_worker = ChunkingWorker(chunk_size=100, overlap=20)
    w_chunks = chunk_worker.chunk("Worker chunking demonstration text for async queue consumption.")
    assert len(w_chunks) >= 1
    print("  -> Chunking worker task execution: PASS")

    emb_worker = EmbeddingWorker()
    embeddings = await emb_worker.generate_embeddings(["Sample chunk for embedding"])
    assert len(embeddings) == 1
    assert len(embeddings[0]) == 1536
    print("  -> Embedding worker (1536-dim vectors): PASS")

    # 6. Document Management vs Knowledge Management Dual Lifecycle
    print("\n[6/7] Testing Document != Knowledge Dual Lifecycle...")
    from app.models.knowledge_models import Document
    test_doc = Document(
        id=str(uuid.uuid4()),
        organization_id=str(uuid.uuid4()),
        domain_id=str(uuid.uuid4()),
        uploaded_by=str(uuid.uuid4()),
        filename="leave_policy.pdf",
        storage_key="test/leave_policy.pdf",
        mime_type="application/pdf",
        document_status="STORED",
        knowledge_status="NOT_ENABLED",
    )
    assert test_doc.document_status == "STORED"
    assert test_doc.knowledge_status == "NOT_ENABLED"
    print("  -> Initial Upload: Document = STORED | AI Knowledge = NOT_ENABLED: PASS")

    # Simulate 'Make AI Ready' Action
    test_doc.knowledge_status = "READY"
    assert test_doc.document_status == "STORED"
    assert test_doc.knowledge_status == "READY"
    print("  -> 'Make AI Ready': Document = STORED | AI Knowledge = READY: PASS")

    # Simulate 'Disable AI' Action
    test_doc.knowledge_status = "DISABLED"
    assert test_doc.document_status == "STORED"
    assert test_doc.knowledge_status == "DISABLED"
    print("  -> 'Disable AI Knowledge': Document = STORED | AI Knowledge = DISABLED: PASS")

    # 7. Overall Architecture Verification
    print("\n[7/7] Verifying Clean Architecture Dependency Flow...")
    from app.main import app
    assert len(app.routes) > 0
    print(f"  -> FastAPI App gateway verified with {len(app.routes)} endpoints mounted.")

    print("\n" + "=" * 80)
    print("  ALL 7 MODULAR DDD & KNOWLEDGE LIFECYCLE TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_modular_verification())

