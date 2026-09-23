import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from app.core.context import get_current_request_context


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter with tenant, domain, and request correlation.
    Filters out passwords, tokens, API keys, and sensitive documents.
    """
    SENSITIVE_KEYS = {"password", "token", "jwt", "secret", "api_key", "authorization", "content"}

    def format(self, record: logging.LogRecord) -> str:
        ctx = get_current_request_context()

        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }

        if ctx:
            log_data.update({
                "user_id": ctx.user_id,
                "organization_id": ctx.organization_id,
                "domain_id": ctx.domain_id,
            })

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Merge extra properties if provided
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            sanitized_extra = {
                k: ("***" if k.lower() in self.SENSITIVE_KEYS else v)
                for k, v in record.extra.items()
            }
            log_data["extra"] = sanitized_extra

        return json.dumps(log_data)


def setup_logging(level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("nexus")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    # Remove existing handlers
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger


logger = setup_logging()
