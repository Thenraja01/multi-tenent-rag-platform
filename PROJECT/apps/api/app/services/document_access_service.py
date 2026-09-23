import logging
from typing import List, Optional, Set
from fastapi import HTTPException, status
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge_models import Document, DocumentUser, DocumentDepartment, DocumentRole
from app.models.identity_models import User, UserDepartment, UserRole, Role, Domain

logger = logging.getLogger("nexusrag.doc_acl")

ACCESS_LEVELS = {"READ": 1, "WRITE": 2, "ADMIN": 3}


class DocumentAccessService:
    """
    Evaluates multi-level document ACL access:
    1. Tenant Isolation: Document.organization_id MUST equal user's organization_id
    2. Domain Isolation: Document.domain_id MUST belong to organization
    3. ACL Check: User ACL OR Department ACL OR Role ACL OR Uploader
    """

    @staticmethod
    async def get_authorized_document_ids(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        domain_id: Optional[str] = None,
        min_access_level: str = "READ",
    ) -> List[str]:
        """
        Compute the list of document IDs the user is authorized to access within the organization/domain:
        1. Org Admins & Superadmins have access across all organization documents.
        2. Normal users only have access to:
           - Documents uploaded by the user
           - Documents explicitly granted to the user via DocumentUser
           - Documents granted to the user's Department via DocumentDepartment
           - Documents granted to the user's Role via DocumentRole
           - Documents with scope 'ORGANIZATION'
        """
        req_level_val = ACCESS_LEVELS.get(min_access_level.upper(), 1)
        valid_levels = [lvl for lvl, val in ACCESS_LEVELS.items() if val >= req_level_val]

        # 1. Check if user is Org Admin or Superadmin
        user = await db.get(User, user_id)
        if user and (getattr(user, "is_org_admin", False) or getattr(user, "is_superadmin", False)):
            admin_stmt = (
                select(Document.id)
                .where(
                    Document.organization_id == organization_id,
                    Document.status != "DELETED",
                )
            )
            if domain_id:
                admin_stmt = admin_stmt.where(Document.domain_id == domain_id)
            admin_res = await db.execute(admin_stmt)
            return list(admin_res.scalars().all())

        # 2. Fetch user's department IDs
        dept_stmt = select(UserDepartment.department_id).where(UserDepartment.user_id == user_id)
        dept_res = await db.execute(dept_stmt)
        user_dept_ids = list(dept_res.scalars().all())

        # 3. Fetch user's role IDs
        role_stmt = select(UserRole.role_id).where(UserRole.user_id == user_id)
        role_res = await db.execute(role_stmt)
        user_role_ids = list(role_res.scalars().all())

        # 4. Base Document Query strictly scoped to tenant and active status
        doc_stmt = (
            select(Document.id)
            .where(
                Document.organization_id == organization_id,
                Document.status != "DELETED",
            )
        )
        if domain_id:
            doc_stmt = doc_stmt.where(Document.domain_id == domain_id)

        # 5. Filter by ACL junction tables or uploader
        acl_filters = [
            Document.uploaded_by == user_id,
            # Explicit User ACL
            Document.id.in_(
                select(DocumentUser.document_id).where(
                    DocumentUser.user_id == user_id,
                    DocumentUser.access_level.in_(valid_levels),
                )
            ),
        ]

        # Department ACL
        if user_dept_ids:
            acl_filters.append(
                Document.id.in_(
                    select(DocumentDepartment.document_id).where(
                        DocumentDepartment.department_id.in_(user_dept_ids),
                        DocumentDepartment.access_level.in_(valid_levels),
                    )
                )
            )

        # Role ACL
        if user_role_ids:
            acl_filters.append(
                Document.id.in_(
                    select(DocumentRole.document_id).where(
                        DocumentRole.role_id.in_(user_role_ids),
                        DocumentRole.access_level.in_(valid_levels),
                    )
                )
            )

        # Global Organization Scope (when not restricted to specific dept/role/user)
        # Check metadata_json for access_scope == 'ORGANIZATION'
        acl_filters.append(
            Document.id.not_in(
                select(DocumentDepartment.document_id)
            ) & Document.id.not_in(
                select(DocumentRole.document_id)
            ) & Document.id.not_in(
                select(DocumentUser.document_id).where(DocumentUser.user_id != user_id)
            )
        )

        doc_stmt = doc_stmt.where(or_(*acl_filters))
        res = await db.execute(doc_stmt)
        return list(res.scalars().all())

    @staticmethod
    async def can_access_document(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        document_id: str,
        min_access_level: str = "READ",
    ) -> bool:
        """Verify if a specific document is accessible to the user."""
        auth_doc_ids = await DocumentAccessService.get_authorized_document_ids(
            db, user_id, organization_id, domain_id=None, min_access_level=min_access_level
        )
        return document_id in auth_doc_ids

    @staticmethod
    async def require_document_access(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        document_id: str,
        min_access_level: str = "READ",
    ) -> Document:
        """Fetch document and raise 404 Not Found if document doesn't exist or cross-tenant access is attempted."""
        # Always verify document belongs to the organization
        doc = await db.get(Document, document_id)
        if not doc or str(doc.organization_id) != str(organization_id) or doc.status == "DELETED":
            # Security mandate: Return 404 rather than revealing another tenant's resource exists
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        is_allowed = await DocumentAccessService.can_access_document(
            db, user_id, organization_id, document_id, min_access_level=min_access_level
        )
        if not is_allowed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        return doc


document_access_service = DocumentAccessService()
