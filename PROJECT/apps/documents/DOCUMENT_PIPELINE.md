# Document Pipeline

1. **Upload**: File received by FastAPI, validated, stored to MinIO
2. **Type detection**: MIME type + magic bytes identify format
3. **Celery task**: Async ingest task queued
4. **Processing**: Text extraction, OCR, structured data parsing
5. **Chunking**: Recursive character splitter
6. **Embedding**: OpenAI text-embedding-3-large
7. **Storage**: Chunk text + embedding upserted to pgvector
