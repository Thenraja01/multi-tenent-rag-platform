import asyncio
import logging
from app.pipelines.document_pipeline.pipeline import DocumentPipeline

logger = logging.getLogger("nexusrag.workers.document")


class DocumentWorker:
    """Consumes document ingestion tasks from Redis/Celery queue."""

    def __init__(self):
        self.pipeline = DocumentPipeline()

    async def process_task(self, task_data: dict) -> dict:
        logger.info(f"Processing document ingestion task: {task_data.get('document_id')}")
        result = await self.pipeline.process(
            file_bytes=task_data["file_bytes"],
            filename=task_data["filename"],
            organization_id=task_data["organization_id"],
            domain_id=task_data["domain_id"],
            document_id=task_data["document_id"],
            mime_type=task_data.get("mime_type"),
        )
        return result


if __name__ == "__main__":
    logger.info("Document Worker started...")
