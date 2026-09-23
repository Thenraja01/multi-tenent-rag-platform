import logging
from typing import List, Dict, Any, Optional
from app.pipelines.document_pipeline.extractor import DocumentTextExtractor
from app.pipelines.document_pipeline.normalizer import TextNormalizer
from app.core.storage.service import storage_service

logger = logging.getLogger("nexusrag.pipelines.document")


class DocumentPipeline:
    """End-to-end ingestion pipeline: Validate -> Store -> Extract -> Normalize -> Chunk."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        organization_id: str,
        domain_id: str,
        document_id: str,
        mime_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        # 1. Store in Object Storage
        storage_key = storage_service.generate_storage_key(organization_id, domain_id, document_id, filename)
        await storage_service.save_file(storage_key, file_bytes, mime_type or "application/octet-stream")

        # 2. Extract Raw Text
        raw_text = DocumentTextExtractor.extract(file_bytes, filename, mime_type)

        # 3. Normalize Text
        normalized_text = TextNormalizer.normalize(raw_text)

        # 4. Chunk Text
        chunks = self.chunk_text(normalized_text)

        return {
            "storage_key": storage_key,
            "text_length": len(normalized_text),
            "chunks_count": len(chunks),
            "chunks": chunks,
        }

    def chunk_text(self, text: str) -> List[str]:
        if not text:
            return []
        chunks = []
        start = 0
        text_len = len(text)
        while start < text_len:
            end = min(start + self.chunk_size, text_len)
            chunks.append(text[start:end])
            if end == text_len:
                break
            start += max(1, self.chunk_size - self.chunk_overlap)
        return chunks
