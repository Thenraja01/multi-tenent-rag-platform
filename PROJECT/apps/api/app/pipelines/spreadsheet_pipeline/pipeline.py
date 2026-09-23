import logging
from typing import Dict, Any, List
from app.pipelines.spreadsheet_pipeline.parser import SpreadsheetParser
from app.core.storage.service import storage_service

logger = logging.getLogger("nexusrag.pipelines.spreadsheet")


class SpreadsheetPipeline:
    """Spreadsheet ingestion pipeline: File -> Tabular Parse -> Markdown Normalization -> Row/Table Chunks."""

    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        organization_id: str,
        domain_id: str,
        document_id: str,
    ) -> Dict[str, Any]:
        storage_key = storage_service.generate_storage_key(organization_id, domain_id, document_id, filename)
        await storage_service.save_file(storage_key, file_bytes, "text/csv")

        rows = SpreadsheetParser.parse_csv(file_bytes)
        markdown_table = SpreadsheetParser.rows_to_markdown_table(rows)

        return {
            "storage_key": storage_key,
            "row_count": len(rows),
            "table_representation": markdown_table,
            "chunks": [markdown_table] if markdown_table else [],
        }
