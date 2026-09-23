import asyncio
import logging
from app.pipelines.document_pipeline.normalizer import TextNormalizer

logger = logging.getLogger("nexusrag.workers.chunking")


class ChunkingWorker:
    """Asynchronously tokenizes and chunks normalized documents."""

    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> list:
        normalized = TextNormalizer.normalize(text)
        chunks = []
        start = 0
        text_len = len(normalized)
        while start < text_len:
            end = min(start + self.chunk_size, text_len)
            chunks.append(normalized[start:end])
            if end == text_len:
                break
            start += max(1, self.chunk_size - self.overlap)
        return chunks


if __name__ == "__main__":
    logger.info("Chunking Worker started...")
