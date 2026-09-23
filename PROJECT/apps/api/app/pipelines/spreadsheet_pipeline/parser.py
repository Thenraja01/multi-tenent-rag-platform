import io
import csv
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("nexusrag.pipelines.spreadsheet.parser")


class SpreadsheetParser:
    """Parses CSV, XLSX, and XLS files into markdown tables or structural chunk representations."""

    @staticmethod
    def parse_csv(file_bytes: bytes) -> List[Dict[str, Any]]:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="ignore")
        
        reader = csv.DictReader(io.StringIO(text))
        return [row for row in reader]

    @staticmethod
    def rows_to_markdown_table(rows: List[Dict[str, Any]]) -> str:
        if not rows:
            return ""
        headers = list(rows[0].keys())
        header_line = "| " + " | ".join(headers) + " |"
        sep_line = "| " + " | ".join(["---"] * len(headers)) + " |"
        body_lines = [
            "| " + " | ".join([str(row.get(h, "")) for h in headers]) + " |"
            for row in rows
        ]
        return "\n".join([header_line, sep_line] + body_lines)
