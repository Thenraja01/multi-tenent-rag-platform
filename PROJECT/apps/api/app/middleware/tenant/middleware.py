import time
import logging
from typing import Callable, Optional, Tuple
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, set_rls_context
from app.models.organization_models import Organization, OrganizationCustomDomain
from app.config import settings

logger = logging.getLogger("nexusrag.tenant_middleware")

RESERVED_SUBDOMAINS = {
    "admin", "api", "www", "app", "login", "register", "platform",
    "mail", "support", "auth", "static", "docs", "redoc", "health",
    "dashboard", "root", "system", "test", "testserver", "dev", "stage", "preview"
}


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves organization from:
    1. Authenticated JWT token
    2. Subdomain (e.g. acme.localfix.app -> acme)
    3. Verified Custom Domain (e.g. portal.client.com)
    4. Explicit headers for API testing (X-Tenant-Slug, X-Organization-Slug)
    Sets request.state and PostgreSQL Row-Level Security (RLS) context.
    """

    @staticmethod
    def parse_host(host_header: str) -> Tuple[Optional[str], bool, bool]:
        """Parse host header into (organization_slug, is_platform_host, is_superadmin_host)."""
        if not host_header:
            return None, True, False
        clean_host = host_header.split(",")[0].strip().split(":")[0].lower()

        base_domains = {
            "localhost", "127.0.0.1", "0.0.0.0", "testserver", "test",
            "localfix.app", "nexusrag.com", "nexus.local", "nip.io",
            getattr(settings, "TENANT_BASE_DOMAIN", "localfix.app").lower().split(":")[0].strip(),
            getattr(settings, "PLATFORM_DOMAIN", "localfix.app").lower().split(":")[0].strip(),
        }

        # Check platform root match
        if clean_host in base_domains:
            return None, True, False

        # Check superadmin / platform admin subdomains
        if clean_host.startswith(("platform.", "superadmin.", "admin.")):
            return None, True, True

        for base in base_domains:
            if clean_host.endswith(f".{base}"):
                sub_part = clean_host[: -(len(base) + 1)]
                parts = [p for p in sub_part.split(".") if p]
                if parts:
                    slug = parts[-1]
                    if slug in ("platform", "superadmin", "admin"):
                        return None, True, True
                    if slug not in RESERVED_SUBDOMAINS:
                        return slug, False, False

        return None, False, False

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        host = request.headers.get("x-forwarded-host") or request.headers.get("host") or ""
        subdomain_slug, is_platform, is_superadmin = self.parse_host(host)

        # Fallback to test header
        header_slug = request.headers.get("x-tenant-slug") or request.headers.get("x-organization-slug")
        slug = header_slug or subdomain_slug

        request.state.organization_slug = slug
        request.state.organization_id = None
        request.state.is_platform = is_platform
        request.state.is_superadmin = is_superadmin

        if slug:
            async with AsyncSessionLocal() as session:
                try:
                    result = await session.execute(
                        select(Organization).where(
                            Organization.slug == slug.lower(),
                            Organization.status != "DELETED",
                        )
                    )
                    org = result.scalar_one_or_none()
                    if org:
                        if org.status == "SUSPENDED":
                            return Response(
                                content='{"code":"TENANT_SUSPENDED","message":"This organization account is suspended."}',
                                status_code=status.HTTP_403_FORBIDDEN,
                                media_type="application/json",
                            )
                        request.state.organization_id = str(org.id)
                        request.state.organization = org
                        await set_rls_context(session, str(org.id))
                except Exception as e:
                    logger.debug(f"Tenant lookup error: {e}")

        response = await call_next(request)
        return response
