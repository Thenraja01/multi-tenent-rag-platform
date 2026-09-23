import functools
import logging
import re
import time
from typing import List, Optional, Set, Sequence, Union
from urllib.parse import urlparse

from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import PlainTextResponse, Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send
from sqlalchemy import select

from app.config import settings

logger = logging.getLogger("nexusrag.cors")

ALL_METHODS = ("DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT")
DEFAULT_EXPOSE_HEADERS = [
    "X-Tenant-Slug",
    "X-Domain-Slug",
    "X-Subdomain-Slug",
    "X-Process-Time-Ms",
    "X-Request-ID",
    "Content-Disposition",
    "Authorization",
]


class DynamicCORSService:
    """
    Manages static and database-backed dynamic CORS origins with TTL-based caching.
    Supports:
    - Default local and platform origins
    - Wildcard regex matching for tenant subdomains (nexusrag.com, localfix.app, etc.)
    - Verified custom domains stored in DB (organization_custom_domains / OrganizationDomainModel)
    - Per-organization/tenant settings in DB (settings.cors_origins / allowed_origins)
    """

    def __init__(self, cache_ttl_seconds: float = 60.0):
        self.cache_ttl_seconds = cache_ttl_seconds
        self._db_origins_cache: Set[str] = set()
        self._last_cache_update: float = 0.0
        self._static_origins: Set[str] = set()
        self._compiled_regex: Optional[re.Pattern] = None
        self._init_static_rules()

    def _init_static_rules(self) -> None:
        """Initialize static origins and regex rules from configuration."""
        static_list = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",

        ]
        if hasattr(settings, "CORS_ORIGINS"):
            cfg = settings.CORS_ORIGINS
            if isinstance(cfg, list):
                static_list.extend(cfg)
            elif isinstance(cfg, str):
                static_list.extend([o.strip() for o in cfg.split(",") if o.strip()])

        self._static_origins = {o.rstrip("/").lower() for o in static_list if o}

        base_domain = getattr(settings, "TENANT_BASE_DOMAIN", "localfix.app").strip()
        platform_domain = getattr(settings, "PLATFORM_DOMAIN", "localfix.app").strip()
        escaped_bases = {
            "localhost",
            "127\\.0\\.0\\.1",
            "localfix\\.app",
            "nexusrag\\.com",
            "nexusrag\\.app",
            "nexus\\.local",
            "nip\\.io",
        }
        if base_domain:
            escaped_bases.add(re.escape(base_domain))
        if platform_domain:
            escaped_bases.add(re.escape(platform_domain))

        joined_bases = "|".join(filter(None, escaped_bases))

        regex_pattern = (
            r"^https?://"
            r"([a-zA-Z0-9_-]+\.)*"
            rf"({joined_bases})"
            r"(:\d+)?$"
        )
        try:
            self._compiled_regex = re.compile(regex_pattern, re.IGNORECASE)
        except Exception as e:
            logger.warning(f"Error compiling CORS origin regex: {e}")
            self._compiled_regex = re.compile(
                r"^https?://([a-zA-Z0-9_-]+\.)*(localhost|127\.0\.0\.1|localfix\.app|nexusrag\.com|nexusrag\.app|nip\.io)(:\d+)?$",
                re.IGNORECASE,
            )

    @staticmethod
    def extract_host(origin: str) -> str:
        """Extract clean hostname/domain from origin URL (e.g. 'https://app.client.com:8080' -> 'app.client.com')."""
        clean = origin.strip().lower()
        if "://" in clean:
            parsed = urlparse(clean)
            return parsed.hostname or ""
        return clean.split(":")[0]

    def invalidate_cache(self) -> None:
        """Invalidate the in-memory dynamic origin cache to force DB re-query."""
        self._last_cache_update = 0.0
        self._db_origins_cache.clear()
        logger.info("CORS dynamic origins cache invalidated.")

    def add_allowed_origin(self, origin: str) -> None:
        """Explicitly add an origin to the in-memory allowed origins list."""
        clean = origin.rstrip("/").lower()
        self._static_origins.add(clean)
        self._db_origins_cache.add(clean)

    async def _refresh_db_origins_if_needed(self) -> None:
        """Fetch custom verified domains and settings from database if cache has expired."""
        now = time.time()
        if (now - self.cache_ttl_seconds) < self._last_cache_update and self._db_origins_cache:
            return

        new_cached_origins: Set[str] = set()

        try:
            from app.database import AsyncSessionLocal
            from app.models.organization_models import OrganizationCustomDomain, OrganizationSettings
            async with AsyncSessionLocal() as session:
                # 1. Query verified custom domains from organization_custom_domains table
                try:
                    stmt = select(OrganizationCustomDomain.hostname).where(
                        OrganizationCustomDomain.verification_status.in_(["VERIFIED", "ACTIVE", "approved"])
                    )
                    res = await session.execute(stmt)
                    for domain_val in res.scalars().all():
                        if domain_val:
                            d = domain_val.strip().lower()
                            new_cached_origins.add(d)
                            new_cached_origins.add(f"https://{d}")
                            new_cached_origins.add(f"http://{d}")
                except Exception as e:
                    logger.debug(f"OrganizationCustomDomain query skipped: {e}")

                # 2. Query OrganizationSettings.security_config for custom cors_origins
                try:
                    stmt = select(OrganizationSettings.security_config)
                    res = await session.execute(stmt)
                    for sec_cfg in res.scalars().all():
                        if isinstance(sec_cfg, dict):
                            origins = sec_cfg.get("cors_origins") or sec_cfg.get("allowed_origins")
                            if isinstance(origins, list):
                                for o in origins:
                                    if isinstance(o, str) and o.strip():
                                        new_cached_origins.add(o.strip().rstrip("/").lower())
                            elif isinstance(origins, str) and origins.strip():
                                for o in origins.split(","):
                                    if o.strip():
                                        new_cached_origins.add(o.strip().rstrip("/").lower())
                except Exception as e:
                    logger.debug(f"OrganizationSettings query skipped: {e}")

            self._db_origins_cache = new_cached_origins
            self._last_cache_update = now
            logger.debug(f"Refreshed CORS origins from DB: {len(self._db_origins_cache)} custom origins cached.")
        except Exception as e:
            logger.warning(f"Could not load dynamic CORS origins from database: {e}")
            self._last_cache_update = now

    async def is_allowed_origin(self, origin: Optional[str]) -> bool:
        """
        Check if an origin is permitted:
        1. Exact match in static origins
        2. Match against base wildcard regex (localfix.app, nexusrag.com, localhost)
        3. Match against dynamic database verified domains and tenant settings
        """
        if not origin:
            return False

        clean_origin = origin.rstrip("/").lower()

        # 1. Fast static check
        if clean_origin in self._static_origins:
            return True

        # 2. Fast regex pattern check
        if self._compiled_regex and self._compiled_regex.fullmatch(clean_origin):
            return True

        # 3. Dynamic DB cache check
        host = self.extract_host(clean_origin)
        if clean_origin in self._db_origins_cache or (host and host in self._db_origins_cache):
            return True

        # Refresh cache from DB and check again
        await self._refresh_db_origins_if_needed()

        if clean_origin in self._db_origins_cache or (host and host in self._db_origins_cache):
            return True

        return False


# Global singleton instance
cors_service = DynamicCORSService()


class DynamicCORSMiddleware:
    """
    High-performance ASGI Middleware for Dynamic Database-Backed CORS.
    Supports OPTIONS preflight and simple/standard HTTP requests with credentials.
    """

    def __init__(
        self,
        app: ASGIApp,
        allow_methods: Sequence[str] = ALL_METHODS,
        allow_headers: Sequence[str] = ("*",),
        expose_headers: Sequence[str] = DEFAULT_EXPOSE_HEADERS,
        allow_credentials: bool = True,
        max_age: int = 86400,
        service: Optional[DynamicCORSService] = None,
    ) -> None:
        self.app = app
        self.allow_methods = allow_methods
        self.allow_headers = [h.lower() for h in allow_headers]
        self.allow_all_headers = "*" in allow_headers
        self.expose_headers = ", ".join(expose_headers)
        self.allow_credentials = allow_credentials
        self.max_age = max_age
        self.service = service or cors_service

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        origin = headers.get("origin")

        if not origin:
            await self.app(scope, receive, send)
            return

        # Preflight OPTIONS check
        if scope["method"] == "OPTIONS" and "access-control-request-method" in headers:
            is_allowed = await self.service.is_allowed_origin(origin)
            if is_allowed:
                response = self._preflight_ok_response(headers, origin)
            else:
                response = PlainTextResponse("Disallowed CORS origin", status_code=400)
            await response(scope, receive, send)
            return

        # Actual request handling with dynamic origin injection
        is_allowed = await self.service.is_allowed_origin(origin)

        async def send_with_cors(message: Message) -> None:
            if message["type"] == "http.response.start":
                message.setdefault("headers", [])
                response_headers = MutableHeaders(scope=message)

                if is_allowed:
                    response_headers["Access-Control-Allow-Origin"] = origin
                    if self.allow_credentials:
                        response_headers["Access-Control-Allow-Credentials"] = "true"
                    if self.expose_headers:
                        response_headers["Access-Control-Expose-Headers"] = self.expose_headers
                    response_headers.add_vary_header("Origin")

            await send(message)

        await self.app(scope, receive, send_with_cors)

    def _preflight_ok_response(self, request_headers: Headers, origin: str) -> PlainTextResponse:
        req_headers = request_headers.get("access-control-request-headers")
        allow_hdr = req_headers if (self.allow_all_headers and req_headers) else ", ".join(self.allow_headers)
        if not allow_hdr:
            allow_hdr = "*"

        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": ", ".join(self.allow_methods),
            "Access-Control-Allow-Headers": allow_hdr,
            "Access-Control-Max-Age": str(self.max_age),
            "Vary": "Origin",
        }
        if self.allow_credentials:
            headers["Access-Control-Allow-Credentials"] = "true"
        if self.expose_headers:
            headers["Access-Control-Expose-Headers"] = self.expose_headers

        return PlainTextResponse("OK", status_code=200, headers=headers)
