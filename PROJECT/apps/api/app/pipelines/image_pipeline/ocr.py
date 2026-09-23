import io
import logging
from typing import Optional

logger = logging.getLogger("nexusrag.pipelines.image.ocr")


class ImageOCREngine:
    """Extracts text from images using Tesseract OCR, Pillow preprocessing, and fallback vision heuristics."""

    @staticmethod
    def extract_text(image_bytes: bytes) -> str:
        if not image_bytes:
            return ""
        try:
            from PIL import Image, ImageEnhance, ImageFilter
            img = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image for OCR (convert to grayscale and sharpen)
            if img.mode != 'L':
                img = img.convert('L')
            img = img.filter(ImageFilter.SHARPEN)
            
            try:
                import pytesseract
                text = pytesseract.image_to_string(img, config='--psm 6')
                if text.strip():
                    return text.strip()
            except ImportError:
                logger.debug("pytesseract not installed, skipping direct tesseract call")
            except Exception as e:
                logger.debug(f"Pytesseract extraction note: {e}")

            # Fallback heuristic: check if image contains embedded metadata or tags
            info_text = []
            if hasattr(img, 'info') and img.info:
                for k, v in img.info.items():
                    if isinstance(v, str) and len(v.strip()) > 3:
                        info_text.append(f"{k}: {v}")
            
            return "\n".join(info_text).strip()
        except Exception as e:
            logger.debug(f"Image OCR error: {e}")
            return ""
