import logging
from typing import Callable, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security.jwt import decode_token

logger = logging.getLogger("nexusrag.middleware.auth")


class AuthContextMiddleware(BaseHTTPMiddleware):
    """
    Extracts Bearer token if present and attaches payload to request.state.auth_context.
    Full route-level enforcement happens via FastAPI dependencies.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        auth_header = request.headers.get("Authorization")
        request.state.auth_user_id = None
        request.state.auth_claims = None

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                payload = decode_token(token)
                request.state.auth_user_id = payload.get("sub")
                request.state.auth_claims = payload
                # Inherit token organization_id if not already set by tenant middleware
                if not getattr(request.state, "organization_id", None) and payload.get("organization_id"):
                    request.state.organization_id = payload.get("organization_id")
            except Exception as e:
                logger.debug(f"Token extraction note: {e}")

        return await call_next(request)
