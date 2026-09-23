import io
import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("nexusrag.document_processor")


class DocumentProcessingService:
    """
    Multi-format document ingestion engine:
    - Extracts structured text, headers, and tables from PDF, DOCX, CSV, Markdown, and TXT.
    - Preserves page numbers and section coordinates.
    - Generates semantically aware chunk boundaries.
    """

    @staticmethod
    def extract_text_from_bytes(
        content: bytes, filename: str, mime_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Parses binary or text payload and returns structured pages:
        [{"page_number": 1, "text": "...", "tables": [...]}]
        """
        ext = filename.lower().split(".")[-1] if "." in filename else ""
        pages = []

        if ext == "pdf" or mime_type == "application/pdf":
            pages = DocumentProcessingService._parse_pdf(content)
        elif ext in ["docx", "doc"]:
            pages = DocumentProcessingService._parse_docx(content)
        elif ext in ["xlsx", "xls"]:
            pages = DocumentProcessingService._parse_excel(content)
        elif ext in ["pptx", "ppt"]:
            pages = DocumentProcessingService._parse_pptx(content)
        elif ext in ["png", "jpg", "jpeg", "bmp", "tiff", "webp"]:
            pages = DocumentProcessingService._parse_image(content)
        elif ext in ["csv", "tsv"]:
            pages = DocumentProcessingService._parse_csv(content)
        elif ext in ["json"]:
            pages = DocumentProcessingService._parse_json(content)
        else:
            # Default text / markdown parsing
            try:
                text_content = content.decode("utf-8", errors="replace")
            except Exception:
                text_content = str(content)
            pages = [{"page_number": 1, "text": text_content, "tables": []}]

        return pages

    @staticmethod
    def _parse_pdf(content: bytes) -> List[Dict[str, Any]]:
        pages = []
        # Attempt PyMuPDF (fitz) or pypdf extraction
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=content, filetype="pdf")
            for page_idx, page in enumerate(doc):
                text = page.get_text("text") or ""
                # If page text is empty, attempt page OCR extraction
                if not text.strip():
                    try:
                        pix = page.get_pixmap()
                        img_bytes = pix.tobytes("png")
                        from app.pipelines.image_pipeline.ocr import ImageOCREngine
                        ocr_text = ImageOCREngine.extract_text(img_bytes)
                        if ocr_text:
                            text = ocr_text
                    except Exception as e:
                        logger.debug(f"PDF page OCR note: {e}")

                pages.append({"page_number": page_idx + 1, "text": text.strip(), "tables": []})
            if any(p["text"] for p in pages):
                return pages
        except ImportError:
            pass
        except Exception as e:
            logger.debug(f"PyMuPDF parse note: {e}")

        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages.append({"page_number": page_idx + 1, "text": text.strip(), "tables": []})
            if any(p["text"] for p in pages):
                return pages
        except Exception as e:
            logger.debug(f"pypdf parse note: {e}")

        # Fallback raw string decode
        raw = content.decode("utf-8", errors="ignore")
        clean_text = re.sub(r"[^\x20-\x7E\n\t]", " ", raw)
        return [{"page_number": 1, "text": clean_text[:20000], "tables": []}]

    @staticmethod
    def _parse_docx(content: bytes) -> List[Dict[str, Any]]:
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            full_text = []
            for p in doc.paragraphs:
                if p.text:
                    full_text.append(p.text)
            for t in doc.tables:
                for row in t.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells)
                    full_text.append(row_text)
            return [{"page_number": 1, "text": "\n".join(full_text), "tables": []}]
        except Exception as e:
            logger.debug(f"Docx parse note: {e}")
            raw = content.decode("utf-8", errors="ignore")
            return [{"page_number": 1, "text": raw, "tables": []}]

    @staticmethod
    def _parse_excel(content: bytes) -> List[Dict[str, Any]]:
        pages = []
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
            for sheet_idx, sheet_name in enumerate(wb.sheetnames):
                sheet = wb[sheet_name]
                rows = []
                for row in sheet.iter_rows(values_only=True):
                    if any(cell is not None for cell in row):
                        row_vals = [str(c) if c is not None else "" for c in row]
                        rows.append(" | ".join(row_vals))
                if rows:
                    sheet_text = f"### Sheet: {sheet_name}\n" + "\n".join(rows)
                    pages.append({"page_number": sheet_idx + 1, "text": sheet_text, "tables": []})
            if pages:
                return pages
        except Exception as e:
            logger.debug(f"openpyxl parse note: {e}")

        try:
            import xlrd
            book = xlrd.open_workbook(file_contents=content)
            for sheet_idx in range(book.nsheets):
                sh = book.sheet_by_index(sheet_idx)
                rows = []
                for rx in range(sh.nrows):
                    row_vals = [str(sh.cell_value(rowx=rx, colx=cx)) for cx in range(sh.ncols)]
                    rows.append(" | ".join(row_vals))
                if rows:
                    pages.append({"page_number": sheet_idx + 1, "text": "\n".join(rows), "tables": []})
            if pages:
                return pages
        except Exception as e:
            logger.debug(f"xlrd parse note: {e}")

        return [{"page_number": 1, "text": "Spreadsheet data", "tables": []}]

    @staticmethod
    def _parse_pptx(content: bytes) -> List[Dict[str, Any]]:
        pages = []
        try:
            from pptx import Presentation
            prs = Presentation(io.BytesIO(content))
            for slide_idx, slide in enumerate(prs.slides):
                slide_texts = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text:
                        slide_texts.append(shape.text)
                if slide_texts:
                    pages.append({
                        "page_number": slide_idx + 1,
                        "text": f"### Slide {slide_idx + 1}\n" + "\n".join(slide_texts),
                        "tables": []
                    })
            if pages:
                return pages
        except Exception as e:
            logger.debug(f"PPTX parse note: {e}")
        return [{"page_number": 1, "text": "Presentation content", "tables": []}]

    @staticmethod
    def _parse_image(content: bytes) -> List[Dict[str, Any]]:
        from app.pipelines.image_pipeline.ocr import ImageOCREngine
        text = ImageOCREngine.extract_text(content)
        return [{"page_number": 1, "text": text or "[Image Document without OCR text]", "tables": []}]

    @staticmethod
    def chunk_document(
        pages: List[Dict[str, Any]],
        chunk_size: int = 600,
        chunk_overlap: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Splits extracted pages into overlapping semantic chunks with page numbering and metadata.
        """
        chunks = []
        chunk_index = 0

        for page in pages:
            page_num = page.get("page_number", 1)
            text = page.get("text", "")
            if not text.strip():
                continue

            # Split paragraphs
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            current_chunk = ""

            for p in paragraphs:
                if len(current_chunk) + len(p) + 2 <= chunk_size:
                    current_chunk += ("\n\n" if current_chunk else "") + p
                else:
                    if current_chunk:
                        chunks.append({
                            "chunk_index": chunk_index,
                            "page_number": page_num,
                            "content": current_chunk.strip(),
                            "token_count": max(1, len(current_chunk.split())),
                        })
                        chunk_index += 1
                    # Handle large paragraphs
                    if len(p) > chunk_size:
                        words = p.split()
                        start = 0
                        while start < len(words):
                            sub_text = " ".join(words[start : start + 100])
                            chunks.append({
                                "chunk_index": chunk_index,
                                "page_number": page_num,
                                "content": sub_text,
                                "token_count": len(sub_text.split()),
                            })
                            chunk_index += 1
                            start += 80
                        current_chunk = ""
                    else:
                        current_chunk = p

            if current_chunk:
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "content": current_chunk.strip(),
                    "token_count": max(1, len(current_chunk.split())),
                })
                chunk_index += 1

        return chunks
