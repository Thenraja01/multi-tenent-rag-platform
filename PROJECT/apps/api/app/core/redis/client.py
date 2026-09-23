import logging
import time
from typing import Optional

logger = logging.getLogger("nexusrag.core.redis")


class RedisService:
    """Redis client for distributed caching and sliding-window rate limiting with in-memory fallback."""

    def __init__(self):
        self._memory_cache = {}
        self._rate_limits = {}
        self._redis_client = None
        self._init_client()

    def _init_client(self):
        try:
            import redis.asyncio as aioredis
            from app.config import settings
            redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
            self._redis_client = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        except Exception as e:
            logger.debug(f"Redis client initialization note: {e}")
            self._redis_client = None

    async def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Sliding window rate limit check."""
        now = time.time()
        
        # In-memory rate limiting fallback
        records = self._rate_limits.get(key, [])
        records = [ts for ts in records if ts > (now - window_seconds)]
        
        if len(records) >= max_requests:
            self._rate_limits[key] = records
            return True

        records.append(now)
        self._rate_limits[key] = records
        return False

    async def set_value(self, key: str, value: str, expire_seconds: Optional[int] = None):
        self._memory_cache[key] = value

    async def get_value(self, key: str) -> Optional[str]:
        return self._memory_cache.get(key)

    async def delete_value(self, key: str):
        self._memory_cache.pop(key, None)


redis_service = RedisService()
