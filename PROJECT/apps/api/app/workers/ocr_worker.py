import asyncio
import logging
from app.pipelines.image_pipeline.pipeline import ImagePipeline

logger = logging.getLogger("nexusrag.workers.ocr")


class OCRWorker:
    """Asynchronously processes OCR and image text extraction."""

    def __init__(self):
        self.pipeline = ImagePipeline()

    async def process_task(self, task_data: dict) -> dict:
        logger.info(f"Processing OCR task: {task_data.get('document_id')}")
        result = await self.pipeline.process(
            file_bytes=task_data["file_bytes"],
            filename=task_data["filename"],
            organization_id=task_data["organization_id"],
            domain_id=task_data["domain_id"],
            document_id=task_data["document_id"],
            mime_type=task_data.get("mime_type", "image/png"),
        )
        return result


if __name__ == "__main__":
    logger.info("OCR Worker started...")
