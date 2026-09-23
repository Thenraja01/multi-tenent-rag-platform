import re
import unicodedata


class TextNormalizer:
    @staticmethod
    def normalize(text: str) -> str:
        if not text:
            return ""
        # Unicode normalization
        text = unicodedata.normalize("NFKD", text)
        # Replace multiple whitespace/newlines
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
