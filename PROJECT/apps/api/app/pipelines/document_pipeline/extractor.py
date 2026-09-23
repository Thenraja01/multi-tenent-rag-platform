import io
import logging
from typing import Optional

logger = logging.getLogger("nexusrag.pipelines.document.extractor")


class DocumentTextExtractor:
    """Extracts structured text from PDF, DOCX, XLSX, PPTX, TXT, CSV, and image files."""

    @staticmethod
    def extract(file_bytes: bytes, filename: str, mime_type: Optional[str] = None) -> str:
        from app.services.document_processing_service import DocumentProcessingService
        pages = DocumentProcessingService.extract_text_from_bytes(file_bytes, filename, mime_type)
        return "\n\n".join(p.get("text", "") for p in pages if p.get("text"))
