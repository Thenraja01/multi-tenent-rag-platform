import logging
from typing import Dict, Any
from app.pipelines.image_pipeline.ocr import ImageOCREngine
from app.pipelines.document_pipeline.normalizer import TextNormalizer
from app.core.storage.service import storage_service

logger = logging.getLogger("nexusrag.pipelines.image")


class ImagePipeline:
    """Image ingestion pipeline: Validate -> Store -> OCR Extraction -> Normalization -> Chunking."""

    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        organization_id: str,
        domain_id: str,
        document_id: str,
        mime_type: str = "image/png",
    ) -> Dict[str, Any]:
        storage_key = storage_service.generate_storage_key(organization_id, domain_id, document_id, filename)
        await storage_service.save_file(storage_key, file_bytes, mime_type)

        raw_text = ImageOCREngine.extract_text(file_bytes)
        normalized = TextNormalizer.normalize(raw_text)

        return {
            "storage_key": storage_key,
            "extracted_text": normalized,
            "chunks": [normalized] if normalized else [],
        }
