import asyncio
import io
from fastapi import UploadFile
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User, Domain
from app.models.organization_models import Organization
from app.models.knowledge_models import Document, DocumentChunk
from app.routers.documents import upload_document, approve_and_ingest_document, reject_document
from app.services.rag_service import rag_service


async def run_workflow_test():
    print("\n=========================================================")
    print("  NexusRAG Document Staging & Approval Workflow Test")
    print("=========================================================\n")

    async with AsyncSessionLocal() as db:
        # Fetch Globex & Admin user Priya
        org_res = await db.execute(select(Organization).where(Organization.slug == "globex"))
        globex = org_res.scalars().first()
        if not globex:
            print("[ERROR] Globex organization not found.")
            return

        priya_res = await db.execute(select(User).where(User.email == "priya@globex.com"))
        priya = priya_res.scalars().first()

        domain_res = await db.execute(select(Domain).where(Domain.organization_id == globex.id, Domain.slug == "hr"))
        hr_domain = domain_res.scalars().first()

        print(f"[1] Testing Staging Upload for User: {priya.full_name} in {globex.name}")

        test_content = b"Confidential Executive Compensation Policy 2026. Executive bonuses are capped at 45 percent of base salary subject to performance metrics."
        file_obj = UploadFile(
            filename="exec_compensation_policy_2026.txt",
            file=io.BytesIO(test_content),
            headers={"content-type": "text/plain"},
        )

        upload_result = await upload_document(
            file=file_obj,
            domain_id=str(hr_domain.id),
            access_scope="ORGANIZATION",
            current_user=priya,
            db=db,
        )

        doc_id = upload_result["id"]
        print(f"  -> Document Staged ID: {doc_id}")
        print(f"  -> Initial Status: {upload_result['status']}")
        print(f"  -> Initial Chunk Count: {upload_result['chunk_count']}")

        assert upload_result["status"] == "PENDING_APPROVAL", "Status must be PENDING_APPROVAL"
        assert upload_result["chunk_count"] == 0, "Chunk count must be 0 before approval"
        print("  [PASS] Document stored with PENDING_APPROVAL and 0 vector chunks.")

        # 2. Test RAG Query Isolation (must NOT find the unapproved document)
        print("\n[2] Testing RAG Query Isolation (Unapproved Document)...")
        rag_before = await rag_service.answer_query(
            db=db,
            user_id=str(priya.id),
            organization_id=str(globex.id),
            query_text="What is the cap on executive bonuses in 2026?",
            domain_id=str(hr_domain.id),
        )
        sources_before = [s.get("filename") for s in rag_before.get("sources", [])]
        print(f"  -> RAG Sources retrieved before approval: {sources_before}")
        assert "exec_compensation_policy_2026.txt" not in sources_before, "Unapproved doc should not appear in RAG sources"
        print("  [PASS] Zero-Trust RAG Isolation verified: Staged document is omitted from RAG retrieval.")

        # 3. Test Admin Approval & RAG Ingestion
        print("\n[3] Testing Admin Approval & Ingestion...")
        approve_result = await approve_and_ingest_document(
            document_id=doc_id,
            current_user=priya,
            db=db,
        )
        print(f"  -> Approved Status: {approve_result['status']}")
        print(f"  -> Ingested Chunk Count: {approve_result['chunk_count']}")

        assert approve_result["status"] == "READY", "Status must transition to READY"
        assert approve_result["chunk_count"] > 0, "Chunk count must be greater than 0"
        print("  [PASS] Approval successfully triggered OCR/text extraction and pgvector chunk indexing.")

        # 4. Test RAG Query After Approval
        print("\n[4] Testing RAG Query After Approval...")
        rag_after = await rag_service.answer_query(
            db=db,
            user_id=str(priya.id),
            organization_id=str(globex.id),
            query_text="Executive Compensation bonuses 45 percent",
            domain_id=str(hr_domain.id),
        )
        sources_after = [s.get("filename") for s in rag_after.get("sources", [])]
        print(f"  -> RAG Sources retrieved after approval: {sources_after}")
        print(f"  -> AI Answer: {rag_after.get('answer', '')[:120]}...")
        assert "exec_compensation_policy_2026.txt" in sources_after, "Approved doc must now be retrieved"
        print("  [PASS] RAG Retrieval verified: Approved document actively used in AI synthesis.")

        # Clean up test document
        print("\n[5] Cleaning up test document...")
        test_doc = await db.get(Document, doc_id)
        if test_doc:
            await db.delete(test_doc)
            await db.commit()
        print("  [PASS] Cleanup complete.\n")
        print(">>> ALL WORKFLOW TESTS PASSED SUCCESSFULLY! <<<\n")


if __name__ == "__main__":
    asyncio.run(run_workflow_test())
