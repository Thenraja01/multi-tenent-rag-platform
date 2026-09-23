import asyncio
import logging
from app.pipelines.rag_pipeline.pipeline import RAGPipeline

logger = logging.getLogger("nexusrag.workers.rag")


class RAGWorker:
    """Consumes asynchronous RAG queries and background knowledge indexing jobs."""

    async def process_query(self, session, query: str, organization_id: str, domain_id: str = None) -> dict:
        logger.info(f"Worker processing async RAG query: {query[:50]}")
        return await RAGPipeline.execute(session, query, organization_id, domain_id)


if __name__ == "__main__":
    logger.info("RAG Worker started...")
