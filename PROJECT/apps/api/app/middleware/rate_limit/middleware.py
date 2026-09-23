import logging
import time
from typing import Callable
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.redis.client import redis_service

logger = logging.getLogger("nexusrag.middleware.rate_limit")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Distributed token bucket rate limiter middleware."""

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        tenant_id = getattr(request.state, "organization_id", None) or "global"
        rate_key = f"rate_limit:{tenant_id}:{client_ip}"

        is_limited = await redis_service.is_rate_limited(rate_key, self.max_requests, self.window_seconds)
        if is_limited:
            return Response(
                content='{"code":"RATE_LIMIT_EXCEEDED","message":"Too many requests, please slow down."}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
            )

        return await call_next(request)
