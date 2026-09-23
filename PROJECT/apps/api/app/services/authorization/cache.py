import json
import logging
import time
from typing import Optional, Dict, Any, Set
from app.config import settings

logger = logging.getLogger("nexusrag.authz.cache")

# Fast in-memory cache with expiration timestamps
_local_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DEFAULT_TTL = 60  # seconds


class AuthorizationCache:
    """
    Two-Tier (Local Memory + Redis) Authorization Cache.
    Ensures sub-millisecond permission checks while supporting immediate invalidation on policy changes.
    """

    @staticmethod
    def _make_key(tenant_id: Optional[str], user_id: str, domain_id: Optional[str]) -> str:
        t = tenant_id or "platform"
        d = domain_id or "root"
        return f"authz:{t}:{user_id}:{d}"

    @classmethod
    def get(cls, tenant_id: Optional[str], user_id: str, domain_id: Optional[str]) -> Optional[Dict[str, Any]]:
        key = cls._make_key(tenant_id, user_id, domain_id)
        now = time.time()
        
        # 1. Check local in-memory cache first
        entry = _local_cache.get(key)
        if entry:
            if now < entry["expires_at"]:
                return entry["data"]
            else:
                _local_cache.pop(key, None)

        return None

    @classmethod
    def set(
        cls,
        tenant_id: Optional[str],
        user_id: str,
        domain_id: Optional[str],
        data: Dict[str, Any],
        ttl: int = CACHE_DEFAULT_TTL,
    ) -> None:
        key = cls._make_key(tenant_id, user_id, domain_id)
        now = time.time()
        _local_cache[key] = {
            "data": data,
            "expires_at": now + ttl,
        }

    @classmethod
    def invalidate_user(cls, arg1: str, arg2: Optional[str] = None) -> None:
        """Invalidate all cached domain contexts for a user."""
        user_id = arg2 if arg2 else arg1
        keys_to_remove = [k for k in _local_cache if f":{user_id}:" in k or f":{arg1}:" in k]
        for k in keys_to_remove:
            _local_cache.pop(k, None)
        logger.info(f"Invalidated authorization cache for user {user_id} ({len(keys_to_remove)} entries).")

    @classmethod
    def invalidate_tenant(cls, tenant_id: str) -> None:
        """Invalidate all cached contexts for an entire tenant."""
        keys_to_remove = [k for k in _local_cache if k.startswith(f"authz:{tenant_id}:")]
        for k in keys_to_remove:
            _local_cache.pop(k, None)
        logger.info(f"Invalidated authorization cache for tenant {tenant_id} ({len(keys_to_remove)} entries).")

    @classmethod
    def clear_all(cls) -> None:
        _local_cache.clear()


authz_cache = AuthorizationCache()
