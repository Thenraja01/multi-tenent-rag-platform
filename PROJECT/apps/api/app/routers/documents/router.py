import io
import os
import uuid
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from pydantic import BaseModel
from sqlalchemy import select, or_, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Domain
from app.models.knowledge_models import Document, DocumentChunk, DocumentUser, DocumentDepartment, DocumentRole
from app.core.storage import storage_service
from app.services.audit_service import audit_service
from app.services.rag_service import SecureRAGService
from app.services.document_access_service import DocumentAccessService
from app.services.authorization import get_request_context, RequestContext, authorize

logger = logging.getLogger("nexusrag.documents")

router = APIRouter(prefix="/documents", tags=["Documents"])


class DocumentACLRequest(BaseModel):
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    role_id: Optional[str] = None
    access_level: str = "READ"


def extract_text_from_file(filename: str, content_bytes: bytes, mime_type: str) -> List[Dict[str, Any]]:
    """
    Multi-Format Document Processing:
    1. Documents: PDF, DOC, DOCX, TXT, PPT, PPTX
    2. Structured Data: XLS, XLSX, CSV
    3. Visual Data: JPG, PNG, JPEG, WEBP, TIFF, BMP (OCR via PIL + pytesseract)
    
    Returns a list of dicts: [{"page": 1, "text": "...", "format_type": "...", "pipeline": "..."}]
    """
    ext = os.path.splitext(filename)[1].lower()
    pages_text = []

    # 1. Documents: PDF Extraction
    if ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_text.append({
                        "page": i + 1,
                        "text": text.strip(),
                        "format_type": "PDF Document",
                        "pipeline": "PDF Text Extraction",
                    })
        except Exception as e:
            logger.debug(f"pypdf extraction failed ({e}), falling back.")

    # 2. Documents: Word (DOCX / DOC)
    elif ext in [".docx", ".doc"]:
        try:
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            # Also extract tables inside docx
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        paragraphs.append(row_text)
            
            full_text = "\n\n".join(paragraphs)
            if full_text:
                pages_text.append({
                    "page": 1,
                    "text": full_text,
                    "format_type": "Word Document",
                    "pipeline": "Docx Paragraph & Table Parser",
                })
        except Exception as e:
            logger.debug(f"docx extraction error: {e}")

    # 3. Documents: PowerPoint (PPT / PPTX)
    elif ext in [".pptx", ".ppt"]:
        try:
            from pptx import Presentation
            prs = Presentation(io.BytesIO(content_bytes))
            for idx, slide in enumerate(prs.slides):
                slide_texts = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        slide_texts.append(shape.text.strip())
                if slide_texts:
                    pages_text.append({
                        "page": idx + 1,
                        "text": f"Slide {idx + 1}:\n" + "\n".join(slide_texts),
                        "format_type": "Presentation Slide",
                        "pipeline": "PowerPoint Shape & Slide Parser",
                    })
        except Exception as e:
            logger.debug(f"pptx extraction error: {e}")

    # 4. Structured Data: Excel (XLSX / XLS) & CSV
    elif ext in [".xlsx", ".xls"]:
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content_bytes), data_only=True)
            for s_idx, sheet in enumerate(wb.sheetnames):
                ws = wb[sheet]
                sheet_lines = []
                for row in ws.iter_rows(values_only=True):
                    row_vals = [str(v).strip() for v in row if v is not None and str(v).strip()]
                    if row_vals:
                        sheet_lines.append(" | ".join(row_vals))
                if sheet_lines:
                    pages_text.append({
                        "page": s_idx + 1,
                        "text": f"Sheet: {sheet}\n" + "\n".join(sheet_lines),
                        "format_type": "Structured Spreadsheet",
                        "pipeline": "Excel Matrix Table Parser",
                    })
        except Exception as e:
            logger.debug(f"Excel extraction error: {e}")

    elif ext == ".csv":
        try:
            import csv
            text_content = content_bytes.decode("utf-8", errors="ignore")
            reader = csv.reader(io.StringIO(text_content))
            csv_lines = [" | ".join([cell.strip() for cell in row if cell.strip()]) for row in reader]
            valid_lines = [l for l in csv_lines if l]
            if valid_lines:
                pages_text.append({
                    "page": 1,
                    "text": f"CSV Dataset: {filename}\n" + "\n".join(valid_lines),
                    "format_type": "Structured CSV",
                    "pipeline": "Delimited Data Table Parser",
                })
        except Exception as e:
            logger.debug(f"CSV extraction error: {e}")

    # 5. Visual Data & Scanned Images: (JPG, PNG, JPEG, WEBP, TIFF, BMP)
    elif ext in [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp"]:
        try:
            from PIL import Image
            img = Image.open(io.BytesIO(content_bytes))
            ocr_text = ""
            try:
                import pytesseract
                ocr_text = pytesseract.image_to_string(img).strip()
            except Exception as ocr_err:
                logger.debug(f"pytesseract OCR engine note: {ocr_err}")

            if ocr_text:
                pages_text.append({
                    "page": 1,
                    "text": f"OCR Extracted Content from {filename}:\n{ocr_text}",
                    "format_type": "Visual Document / Image",
                    "pipeline": "Optical Character Recognition (OCR) Engine",
                })
            else:
                pages_text.append({
                    "page": 1,
                    "text": f"Visual Document Image: {filename} (Dimensions: {img.width}x{img.height}, Format: {img.format})",
                    "format_type": "Visual Image Metadata",
                    "pipeline": "Visual Metadata Parser",
                })
        except Exception as e:
            logger.debug(f"Image processing error: {e}")

    # 6. Plain Text / Markdown / Code Fallback
    if not pages_text:
        text = content_bytes.decode("utf-8", errors="ignore").strip()
        if text:
            pages_text.append({
                "page": 1,
                "text": text,
                "format_type": "Text Document",
                "pipeline": "Direct UTF-8 Stream Parser",
            })
        else:
            pages_text.append({
                "page": 1,
                "text": f"Knowledge Resource: {filename}",
                "format_type": "Generic Resource",
                "pipeline": "Fallback Indexer",
            })

    return pages_text


def chunk_extracted_text(pages_text: List[Dict[str, Any]], chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    """Chunk pages of text into overlapping semantic passages."""
    chunks = []
    chunk_idx = 0
    for page_item in pages_text:
        page_num = page_item.get("page", 1)
        raw_text = page_item.get("text", "")
        if not raw_text:
            continue

        step = max(1, chunk_size - overlap)
        for start in range(0, len(raw_text), step):
            content = raw_text[start : start + chunk_size].strip()
            if len(content) > 10:  # Skip tiny fragments
                chunks.append({
                    "chunk_index": chunk_idx,
                    "page_number": page_num,
                    "content": content,
                })
                chunk_idx += 1

    if not chunks:
        chunks.append({
            "chunk_index": 0,
            "page_number": 1,
            "content": pages_text[0]["text"][:chunk_size] if pages_text else "Empty document content",
        })
    return chunks


@router.get("")
async def list_documents(
    domain_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all documents authorized for the user within the organization or domain."""
    if current_user.organization_id:
        auth_doc_ids = await DocumentAccessService.get_authorized_document_ids(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(current_user.organization_id),
            domain_id=domain_id,
            min_access_level="READ",
        )
        if not auth_doc_ids:
            return []
        stmt = select(Document).where(Document.id.in_(auth_doc_ids))
    else:
        stmt = select(Document)
        if domain_id:
            stmt = stmt.where(Document.domain_id == domain_id)

    if status:
        stmt = stmt.where(Document.status == status)

    stmt = stmt.order_by(Document.created_at.desc())
    res = await db.execute(stmt)
    docs = res.scalars().all()
    return [
        {
            "id": str(d.id),
            "filename": d.filename,
            "original_filename": d.filename,
            "name": d.filename,
            "status": getattr(d, "knowledge_status", d.status) or d.status,
            "document_status": getattr(d, "document_status", "STORED") or "STORED",
            "knowledge_status": getattr(d, "knowledge_status", "NOT_ENABLED") or "NOT_ENABLED",
            "file_size": d.file_size,
            "page_count": d.page_count or 0,
            "chunk_count": d.chunk_count or 0,
            "embedding_model": getattr(d, "embedding_model", "nomic-embed-text"),
            "domain_id": str(d.domain_id) if d.domain_id else None,
            "uploaded_by": str(d.uploaded_by) if d.uploaded_by else None,
            "knowledge_enabled_at": d.knowledge_enabled_at.isoformat() if getattr(d, "knowledge_enabled_at", None) else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    domain_id: Optional[str] = Form(None),
    access_scope: Optional[str] = Form("ORGANIZATION"),  # ORGANIZATION, DEPARTMENT, ROLE, USER
    department_id: Optional[str] = Form(None),
    role_id: Optional[str] = Form(None),
    target_user_id: Optional[str] = Form(None),
    access_level: Optional[str] = Form("READ"),  # READ, WRITE, ADMIN
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and securely store original document in MinIO/S3 + PostgreSQL.
    Document is marked STORED with AI Knowledge = NOT_ENABLED until explicitly activated.
    """
    authorize(ctx, "document", "upload")

    target_domain_id = domain_id
    if target_domain_id:
        d_stmt = select(Domain).where(
            or_(
                Domain.organization_id == current_user.organization_id,
                Domain.organization_id.is_(None),
            ),
            or_(
                Domain.id == target_domain_id,
                Domain.slug == target_domain_id,
            ),
        )
        d_obj = (await db.execute(d_stmt)).scalars().first()
        if d_obj:
            target_domain_id = str(d_obj.id)
    else:
        domain_res = await db.execute(
            select(Domain).where(Domain.organization_id == current_user.organization_id, Domain.status == "ACTIVE")
        )
        first_domain = domain_res.scalars().first()
        if first_domain:
            target_domain_id = str(first_domain.id)

    content_bytes = await file.read()
    file_size = len(content_bytes)
    doc_id = str(uuid.uuid4())
    storage_key = storage_service.generate_storage_key(
        str(current_user.organization_id), target_domain_id or "default", doc_id, file.filename
    )

    await storage_service.save_file(storage_key, content_bytes, file.content_type or "application/octet-stream")

    clean_scope = access_scope if isinstance(access_scope, str) else "ORGANIZATION"
    clean_dept_id = department_id if isinstance(department_id, str) else None
    clean_role_id = role_id if isinstance(role_id, str) else None
    clean_target_user_id = target_user_id if isinstance(target_user_id, str) else None
    clean_access_level = access_level if isinstance(access_level, str) else "READ"

    doc = Document(
        id=doc_id,
        organization_id=current_user.organization_id,
        domain_id=target_domain_id,
        uploaded_by=current_user.id,
        filename=file.filename,
        storage_key=storage_key,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        status="STORED",
        document_status="STORED",
        knowledge_status="NOT_ENABLED",
        page_count=None,
        chunk_count=0,
        metadata_json={
            "access_scope": clean_scope,
            "department_id": clean_dept_id,
            "role_id": clean_role_id,
            "target_user_id": clean_target_user_id,
            "access_level": clean_access_level,
        },
    )
    db.add(doc)
    await db.flush()

    db.add(DocumentUser(document_id=doc.id, user_id=current_user.id, access_level="ADMIN"))

    if clean_scope == "DEPARTMENT" and clean_dept_id:
        db.add(DocumentDepartment(document_id=doc.id, department_id=clean_dept_id, access_level=clean_access_level))
    elif clean_scope == "ROLE" and clean_role_id:
        db.add(DocumentRole(document_id=doc.id, role_id=clean_role_id, access_level=clean_access_level))
    elif clean_scope == "USER" and clean_target_user_id and clean_target_user_id != str(current_user.id):
        db.add(DocumentUser(document_id=doc.id, user_id=clean_target_user_id, access_level=clean_access_level))

    await db.commit()
    await db.refresh(doc)

    await audit_service.log_event(
        db=db,
        action="DOCUMENT_STORED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="document",
        resource_id=str(doc.id),
        metadata={
            "filename": file.filename,
            "size": file_size,
            "document_status": "STORED",
            "knowledge_status": "NOT_ENABLED",
            "access_scope": access_scope,
        },
    )

    return {
        "id": str(doc.id),
        "filename": doc.filename,
        "name": doc.filename,
        "status": doc.status,
        "document_status": doc.document_status,
        "knowledge_status": doc.knowledge_status,
        "file_size": doc.file_size,
        "page_count": doc.page_count or 0,
        "chunk_count": doc.chunk_count or 0,
        "domain_id": target_domain_id,
        "access_scope": access_scope,
        "uploaded_by": str(doc.uploaded_by),
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


@router.post("/upload-multiple", status_code=status.HTTP_201_CREATED)
@router.post("/batch-upload", status_code=status.HTTP_201_CREATED)
async def upload_multiple_documents(
    files: List[UploadFile] = File(...),
    domain_id: Optional[str] = Form(None),
    access_scope: Optional[str] = Form("ORGANIZATION"),
    department_id: Optional[str] = Form(None),
    role_id: Optional[str] = Form(None),
    target_user_id: Optional[str] = Form(None),
    access_level: Optional[str] = Form("READ"),
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Batch multi-file upload endpoint supporting multiple documents simultaneously.
    Stores files securely with Document Status = STORED and AI Knowledge = NOT_ENABLED.
    """
    authorize(ctx, "document", "upload")

    target_domain_id = domain_id
    if target_domain_id:
        d_stmt = select(Domain).where(
            or_(
                Domain.organization_id == current_user.organization_id,
                Domain.organization_id.is_(None),
            ),
            or_(
                Domain.id == target_domain_id,
                Domain.slug == target_domain_id,
            ),
        )
        d_obj = (await db.execute(d_stmt)).scalars().first()
        if d_obj:
            target_domain_id = str(d_obj.id)
    else:
        domain_res = await db.execute(
            select(Domain).where(Domain.organization_id == current_user.organization_id, Domain.status == "ACTIVE")
        )
        first_domain = domain_res.scalars().first()
        if first_domain:
            target_domain_id = str(first_domain.id)

    clean_scope = access_scope if isinstance(access_scope, str) else "ORGANIZATION"
    clean_dept_id = department_id if isinstance(department_id, str) else None
    clean_role_id = role_id if isinstance(role_id, str) else None
    clean_target_user_id = target_user_id if isinstance(target_user_id, str) else None
    clean_access_level = access_level if isinstance(access_level, str) else "READ"

    uploaded_docs = []

    for file in files:
        content_bytes = await file.read()
        file_size = len(content_bytes)
        doc_id = str(uuid.uuid4())
        storage_key = storage_service.generate_storage_key(
            str(current_user.organization_id), target_domain_id or "default", doc_id, file.filename
        )

        await storage_service.save_file(storage_key, content_bytes, file.content_type or "application/octet-stream")

        doc = Document(
            id=doc_id,
            organization_id=current_user.organization_id,
            domain_id=target_domain_id,
            uploaded_by=current_user.id,
            filename=file.filename,
            storage_key=storage_key,
            mime_type=file.content_type or "application/octet-stream",
            file_size=file_size,
            status="STORED",
            document_status="STORED",
            knowledge_status="NOT_ENABLED",
            page_count=None,
            chunk_count=0,
            metadata_json={
                "access_scope": clean_scope,
                "department_id": clean_dept_id,
                "role_id": clean_role_id,
                "target_user_id": clean_target_user_id,
                "access_level": clean_access_level,
            },
        )
        db.add(doc)
        await db.flush()

        db.add(DocumentUser(document_id=doc.id, user_id=current_user.id, access_level="ADMIN"))

        if clean_scope == "DEPARTMENT" and clean_dept_id:
            db.add(DocumentDepartment(document_id=doc.id, department_id=clean_dept_id, access_level=clean_access_level))
        elif clean_scope == "ROLE" and clean_role_id:
            db.add(DocumentRole(document_id=doc.id, role_id=clean_role_id, access_level=clean_access_level))
        elif clean_scope == "USER" and clean_target_user_id and clean_target_user_id != str(current_user.id):
            db.add(DocumentUser(document_id=doc.id, user_id=clean_target_user_id, access_level=clean_access_level))

        uploaded_docs.append({
            "id": str(doc.id),
            "filename": doc.filename,
            "name": doc.filename,
            "document_status": doc.document_status,
            "knowledge_status": doc.knowledge_status,
            "status": doc.status,
            "file_size": doc.file_size,
            "domain_id": target_domain_id,
            "access_scope": clean_scope,
            "uploaded_by": str(doc.uploaded_by),
        })

    await db.commit()

    return {
        "message": f"Successfully stored {len(uploaded_docs)} documents.",
        "uploaded_count": len(uploaded_docs),
        "documents": uploaded_docs,
    }


@router.post("/{document_id}/knowledge/enable")
@router.post("/{document_id}/make-ai-ready")
@router.post("/{document_id}/approve")
async def enable_ai_knowledge(
    document_id: str,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    'Make AI Ready' Action:
    Triggers OCR parsing, semantic chunking, and pgvector vector embedding ingestion.
    Transitions AI Knowledge from NOT_ENABLED/DISABLED/FAILED -> READY.
    """
    authorize(ctx, "document", "approve")

    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    content_bytes = await storage_service.read_file(doc.storage_key)
    if not content_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document binary file not found in storage.")

    doc.knowledge_status = "PROCESSING"
    doc.status = "PROCESSING"
    await db.commit()

    try:
        pages_text = extract_text_from_file(doc.filename, content_bytes, doc.mime_type or "")
        chunks_data = chunk_extracted_text(pages_text)

        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))

        for chunk_item in chunks_data:
            embedding_vec = await SecureRAGService.get_embedding(chunk_item["content"])
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=chunk_item["chunk_index"],
                content=chunk_item["content"],
                embedding=embedding_vec,
                chunk_metadata={"filename": doc.filename, "page": chunk_item["page_number"]},
                page_number=chunk_item["page_number"],
            )
            db.add(chunk)

        doc.knowledge_status = "READY"
        doc.document_status = "STORED"
        doc.status = "READY"
        doc.knowledge_enabled_by = current_user.id
        doc.knowledge_enabled_at = datetime.now(timezone.utc)
        doc.page_count = len(pages_text)
        doc.chunk_count = len(chunks_data)
        await db.commit()
        await db.refresh(doc)

        await audit_service.log_event(
            db=db,
            action="AI_KNOWLEDGE_ENABLED",
            organization_id=str(current_user.organization_id),
            actor_id=str(current_user.id),
            resource_type="document",
            resource_id=str(doc.id),
            metadata={
                "filename": doc.filename,
                "chunks": len(chunks_data),
                "knowledge_status": "READY",
            },
        )

        return {
            "id": str(doc.id),
            "filename": doc.filename,
            "document_status": doc.document_status,
            "knowledge_status": doc.knowledge_status,
            "status": doc.status,
            "chunk_count": doc.chunk_count,
            "page_count": doc.page_count,
            "message": "Document successfully converted into AI Knowledge and indexed for RAG retrieval.",
        }
    except Exception as e:
        logger.exception(f"Failed to ingest knowledge document {document_id}: {e}")
        doc.knowledge_status = "FAILED"
        doc.status = "FAILED"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract and index AI knowledge: {str(e)}",
        )


@router.post("/{document_id}/knowledge/disable")
@router.post("/{document_id}/disable-ai")
async def disable_ai_knowledge(
    document_id: str,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    'Disable AI Knowledge' Action:
    Excludes document from RAG search while preserving original file in MinIO/S3 storage.
    Transitions AI Knowledge -> DISABLED without deleting the underlying document.
    """
    authorize(ctx, "document", "approve")

    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc.knowledge_status = "DISABLED"
    doc.status = "DISABLED"
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="AI_KNOWLEDGE_DISABLED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="document",
        resource_id=str(doc.id),
        metadata={"filename": doc.filename, "knowledge_status": "DISABLED"},
    )

    return {
        "id": str(doc.id),
        "filename": doc.filename,
        "document_status": doc.document_status,
        "knowledge_status": "DISABLED",
        "message": "Document successfully disabled from AI knowledge retrieval. Original file remains stored.",
    }


@router.post("/{document_id}/knowledge/reprocess")
async def reprocess_knowledge(
    document_id: str,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    'Reprocess Knowledge' Action:
    Re-extracts, re-chunks, and re-embeds existing stored document from storage.
    """
    return await enable_ai_knowledge(document_id, ctx, current_user, db)


@router.get("/{document_id}/knowledge/status")
async def get_knowledge_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """View real-time AI knowledge processing and indexing status."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    return {
        "document_id": str(doc.id),
        "filename": doc.filename,
        "document_status": getattr(doc, "document_status", "STORED"),
        "knowledge_status": getattr(doc, "knowledge_status", "NOT_ENABLED"),
        "chunk_count": doc.chunk_count or 0,
        "embedding_model": getattr(doc, "embedding_model", "nomic-embed-text"),
        "knowledge_enabled_at": doc.knowledge_enabled_at.isoformat() if getattr(doc, "knowledge_enabled_at", None) else None,
    }


@router.post("/{document_id}/reject")
async def reject_document(
    document_id: str,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject a staged document from RAG ingestion."""
    authorize(ctx, "document", "approve")

    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc.status = "REJECTED"
    doc.knowledge_status = "DISABLED"
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="DOCUMENT_REJECTED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="document",
        resource_id=str(doc.id),
        metadata={"filename": doc.filename},
    )
    return {"message": "Document rejected successfully.", "status": "REJECTED"}



@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete document metadata with domain, department, and uploader info."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    domain_name = "HR"
    if doc.domain_id:
        d_res = await db.get(Domain, doc.domain_id)
        if d_res:
            domain_name = d_res.name

    uploader_name = "Admin"
    if doc.uploaded_by:
        u_res = await db.get(User, doc.uploaded_by)
        if u_res:
            uploader_name = u_res.full_name or u_res.email

    meta = doc.metadata_json or {}
    f_size = doc.file_size or 0
    f_size_str = f"{f_size / (1024 * 1024):.1f} MB" if f_size >= 1024 * 1024 else f"{f_size / 1024:.0f} KB" if f_size > 0 else "2.4 MB"

    return {
        "id": str(doc.id),
        "filename": doc.filename,
        "name": doc.filename,
        "status": getattr(doc, "knowledge_status", doc.status) or doc.status,
        "document_status": getattr(doc, "document_status", "STORED"),
        "knowledge_status": getattr(doc, "knowledge_status", "READY"),
        "file_size": doc.file_size,
        "file_size_formatted": f_size_str,
        "mime_type": doc.mime_type or "application/pdf",
        "domain_id": str(doc.domain_id) if doc.domain_id else None,
        "domain_name": domain_name,
        "department_name": meta.get("department_name") or "Human Resources",
        "uploaded_by": str(doc.uploaded_by) if doc.uploaded_by else None,
        "uploaded_by_name": uploader_name,
        "page_count": doc.page_count or 32,
        "pages": doc.page_count or 32,
        "chunk_count": doc.chunk_count or 12,
        "description": meta.get("description") or f"Official organizational documentation and policy reference for {doc.filename}.",
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


@router.get("/{document_id}/chunks")
async def get_document_chunks(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all chunks for a document."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    res = await db.execute(
        select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index.asc())
    )
    chunks = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "chunk_index": c.chunk_index,
            "page_number": c.page_number,
            "content": c.content,
            "metadata": c.chunk_metadata,
        }
        for c in chunks
    ]


@router.get("/{document_id}/acl")
async def get_document_acl(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all ACL rules for a document."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    user_rules = (await db.execute(select(DocumentUser).where(DocumentUser.document_id == doc.id))).scalars().all()
    dept_rules = (await db.execute(select(DocumentDepartment).where(DocumentDepartment.document_id == doc.id))).scalars().all()
    role_rules = (await db.execute(select(DocumentRole).where(DocumentRole.document_id == doc.id))).scalars().all()

    return {
        "users": [{"user_id": str(u.user_id), "access_level": u.access_level} for u in user_rules],
        "departments": [{"department_id": str(d.department_id), "access_level": d.access_level} for d in dept_rules],
        "roles": [{"role_id": str(r.role_id), "access_level": r.access_level} for r in role_rules],
    }


@router.post("/{document_id}/acl")
async def assign_document_acl(
    document_id: str,
    payload: DocumentACLRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Grant document access level to user, department, or role."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if payload.user_id:
        # Check if rule exists, update or create
        existing = (await db.execute(
            select(DocumentUser).where(DocumentUser.document_id == doc.id, DocumentUser.user_id == payload.user_id)
        )).scalars().first()
        if existing:
            existing.access_level = payload.access_level
        else:
            db.add(DocumentUser(document_id=doc.id, user_id=payload.user_id, access_level=payload.access_level))
    elif payload.department_id:
        existing = (await db.execute(
            select(DocumentDepartment).where(DocumentDepartment.document_id == doc.id, DocumentDepartment.department_id == payload.department_id)
        )).scalars().first()
        if existing:
            existing.access_level = payload.access_level
        else:
            db.add(DocumentDepartment(document_id=doc.id, department_id=payload.department_id, access_level=payload.access_level))
    elif payload.role_id:
        existing = (await db.execute(
            select(DocumentRole).where(DocumentRole.document_id == doc.id, DocumentRole.role_id == payload.role_id)
        )).scalars().first()
        if existing:
            existing.access_level = payload.access_level
        else:
            db.add(DocumentRole(document_id=doc.id, role_id=payload.role_id, access_level=payload.access_level))

    await db.commit()
    return {"message": "Document access rule updated successfully"}


@router.delete("/{document_id}/acl/{acl_type}/{target_id}")
async def delete_document_acl(
    document_id: str,
    acl_type: str,
    target_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke a document ACL rule."""
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if acl_type == "user":
        await db.execute(delete(DocumentUser).where(DocumentUser.document_id == doc.id, DocumentUser.user_id == target_id))
    elif acl_type == "department":
        await db.execute(delete(DocumentDepartment).where(DocumentDepartment.document_id == doc.id, DocumentDepartment.department_id == target_id))
    elif acl_type == "role":
        await db.execute(delete(DocumentRole).where(DocumentRole.document_id == doc.id, DocumentRole.role_id == target_id))
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid acl_type (user, department, role)")

    await db.commit()
    return {"message": "ACL rule revoked successfully"}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete document and its associated chunks and storage."""
    authorize(ctx, "document", "delete", module_slug="documents")
    doc = await db.get(Document, document_id)
    if not doc or (current_user.organization_id and str(doc.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    await storage_service.delete_file(doc.storage_key)
    await db.delete(doc)
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="DOCUMENT_DELETED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="document",
        resource_id=document_id,
    )
    return {"message": "Document deleted successfully"}
