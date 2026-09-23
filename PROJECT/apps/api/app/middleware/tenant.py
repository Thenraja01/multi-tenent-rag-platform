import time
import logging
from typing import Callable, Optional, Tuple
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select

from app.database import AsyncSessionLocal, set_rls_context
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
                    slug = parts[-1]  # tenant is last part before base
                    if slug in ("platform", "superadmin", "admin"):
                        return None, True, True
                    if slug not in RESERVED_SUBDOMAINS:
                        return slug, False, False

        return None, False, False

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        host_header = request.headers.get("x-forwarded-host") or request.headers.get("host", "localhost")
        org_slug, is_platform, is_superadmin = self.parse_host(host_header)

        # Header override for testing
        header_slug = request.headers.get("x-tenant-slug") or request.headers.get("x-organization-slug")
        if header_slug:
            org_slug = header_slug.strip().lower()

        org_id = None
        org_status = None

        async with AsyncSessionLocal() as session:
            # 1. Custom Domain Lookup if not matched by subdomain
            if not org_slug and not is_platform and not is_superadmin:
                clean_host = host_header.split(",")[0].strip().split(":")[0].lower()
                cd_stmt = (
                    select(OrganizationCustomDomain.organization_id, Organization.slug, Organization.status)
                    .join(Organization, Organization.id == OrganizationCustomDomain.organization_id)
                    .where(
                        OrganizationCustomDomain.hostname == clean_host,
                        OrganizationCustomDomain.verification_status == "VERIFIED",
                        Organization.deleted_at.is_(None),
                    )
                )
                cd_res = await session.execute(cd_stmt)
                cd_match = cd_res.first()
                if cd_match:
                    org_id = str(cd_match[0])
                    org_slug = cd_match[1]
                    org_status = cd_match[2]

            # 2. Slug Resolution
            if org_slug and not org_id:
                org_stmt = select(Organization.id, Organization.status).where(
                    Organization.slug == org_slug,
                    Organization.deleted_at.is_(None),
                )
                org_res = await session.execute(org_stmt)
                org_row = org_res.first()
                if org_row:
                    org_id = str(org_row[0])
                    org_status = org_row[1]

            # 3. Suspended Organization Check
            if org_status == "SUSPENDED":
                return Response(
                    content='{"error": {"code": "ORGANIZATION_SUSPENDED", "message": "This organization is currently suspended."}}',
                    status_code=status.HTTP_403_FORBIDDEN,
                    media_type="application/json",
                )

            # 4. Set RLS Context if Organization Resolved
            if org_id:
                await set_rls_context(session, org_id)

        request.state.organization_id = org_id
        request.state.organization_slug = org_slug
        request.state.is_platform = is_platform
        request.state.is_superadmin = is_superadmin

        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        if org_slug:
            response.headers["X-Tenant-Slug"] = org_slug
            response.headers["X-Organization-Slug"] = org_slug

        return response
