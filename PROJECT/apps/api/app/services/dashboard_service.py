import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity_models import User, Department, Role, UserDepartment, UserRole
from app.models.platform_models import Module, PackModule
from app.models.organization_models import Organization, OrganizationPack
from app.models.hr_models import AttendanceRecord, LeaveRequest, Employee
from app.models.finance_models import Invoice, Expense, Budget, Vendor
from app.models.knowledge_models import Document
from app.services.permission_service import PermissionService
from app.services.data_scope_service import DataScopeService

logger = logging.getLogger("nexusrag.dashboard_service")


class DashboardService:
    """
    Dynamic Department-Focused Dashboard Engine:
    Calculates cards matching active organization packs + user effective permissions + department context + data scopes.
    """

    @staticmethod
    async def get_dashboard_cards(
        db: AsyncSession,
        user: User,
    ) -> Dict[str, Any]:
        org_id = user.organization_id

        # 1. Fetch Organization Active Modules
        enabled_module_slugs = set()
        if org_id:
            pack_stmt = (
                select(Module.slug)
                .join(PackModule, PackModule.module_id == Module.id)
                .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
                .where(
                    OrganizationPack.organization_id == org_id,
                    OrganizationPack.is_active == True,
                    Module.is_active == True,
                )
            )
            pack_res = await db.execute(pack_stmt)
            enabled_module_slugs = set(pack_res.scalars().all())

            # Always allow universal workspace modules if active in system
            universal = {
                "ai", "documents", "nexus", "dashboard", "users", "roles", "departments",
                "finance_dashboard", "invoices", "expense_claims", "attendance", "leave", "hr_core"
            }
            enabled_module_slugs.update(universal)
        else:
            # Superadmin has all active modules
            all_m = (await db.execute(select(Module.slug).where(Module.is_active == True))).scalars().all()
            enabled_module_slugs = set(all_m)

        # 2. Fetch User's Primary Department and Roles
        user_dept = None
        user_roles_slugs = set()
        if user.id:
            dept_res = await db.execute(
                select(Department)
                .join(UserDepartment, UserDepartment.department_id == Department.id)
                .where(UserDepartment.user_id == user.id)
            )
            user_dept = dept_res.scalars().first()

            role_res = await db.execute(
                select(Role.slug)
                .join(UserRole, UserRole.role_id == Role.id)
                .where(UserRole.user_id == user.id)
            )
            user_roles_slugs = set(role_res.scalars().all())

        is_finance_dept = False
        is_hr_dept = False

        if user_dept:
            dept_slug = user_dept.slug.lower()
            if "finance" in dept_slug or "acc" in dept_slug:
                is_finance_dept = True
            elif "hr" in dept_slug or "human" in dept_slug or "people" in dept_slug:
                is_hr_dept = True

        # Check role hints if department not set
        if not is_finance_dept and not is_hr_dept:
            for r_slug in user_roles_slugs:
                if "finance" in r_slug:
                    is_finance_dept = True
                elif "hr" in r_slug:
                    is_hr_dept = True

        # 3. Fetch Effective Permissions
        effective_perms = await PermissionService.get_effective_permissions(
            db=db,
            user_id=str(user.id),
            organization_id=str(org_id) if org_id else None,
        )
        is_admin = "*" in effective_perms or user.is_org_admin

        # 4. Fetch Data Scopes
        data_scopes = await DataScopeService.get_all_data_scopes(db, user)

        # 5. Define Extended Card Catalog
        CARD_CATALOG = [
            # --- HR Cards ---
            {
                "id": "attendance_summary",
                "title": "Attendance Overview",
                "module": "attendance",
                "required_permission": "attendance:view",
                "size": "medium",
                "category": "hr",
                "position": 1,
            },
            {
                "id": "leave_balance",
                "title": "Leave & Time Off",
                "module": "leave",
                "required_permission": "leave:view",
                "size": "medium",
                "category": "hr",
                "position": 2,
            },
            {
                "id": "leave_approval",
                "title": "Pending Leave Approvals",
                "module": "leave",
                "required_permission": "leave:approve",
                "size": "large",
                "category": "hr",
                "position": 3,
            },
            {
                "id": "employee_count",
                "title": "Department Headcount",
                "module": "users",
                "required_permission": "user:view",
                "size": "medium",
                "category": "hr",
                "position": 4,
            },
            # --- Finance Cards ---
            {
                "id": "finance_overview",
                "title": "Financial KPI Overview",
                "module": "finance_dashboard",
                "required_permission": "finance:view",
                "size": "large",
                "category": "finance",
                "position": 5,
            },
            {
                "id": "invoice_approval",
                "title": "Vendor Invoices & Approvals",
                "module": "invoices",
                "required_permission": "invoice:view",
                "size": "medium",
                "category": "finance",
                "position": 6,
            },
            {
                "id": "expense_approval",
                "title": "Employee Expense Claims",
                "module": "expense_claims",
                "required_permission": "expense:view",
                "size": "medium",
                "category": "finance",
                "position": 7,
            },
            {
                "id": "budget_alerts",
                "title": "Department Budget Utilization",
                "module": "finance_dashboard",
                "required_permission": "budget:view",
                "size": "large",
                "category": "finance",
                "position": 8,
            },
            # --- Universal Cards ---
            {
                "id": "documents",
                "title": "Department Knowledge & Documents",
                "module": "documents",
                "required_permission": "document:view",
                "size": "medium",
                "category": "universal",
                "position": 9,
            },
            {
                "id": "nexus_ai",
                "title": "Nexus AI Copilot (RAG)",
                "module": "ai",
                "required_permission": "rag:query",
                "size": "large",
                "category": "universal",
                "position": 10,
            },
        ]

        # 6. Filter Cards by Department Focus, Enabled Modules & Permissions
        visible_cards = []
        for card in CARD_CATALOG:
            mod_slug = card["module"]
            card_category = card.get("category", "universal")

            # Department Filtering:
            # If user is in Finance department and not Org Admin, do not show HR operational cards
            if is_finance_dept and not is_admin and card_category == "hr":
                continue
            # If user is in HR department and not Org Admin, do not show Finance cards
            if is_hr_dept and not is_admin and card_category == "finance":
                continue

            # Permission check
            req_perm = card["required_permission"]
            has_perm = is_admin or req_perm in effective_perms
            
            # Special permissive check for finance view
            if not has_perm:
                if req_perm == "finance:view" and ("invoice:view" in effective_perms or "expense:view" in effective_perms or "budget:view" in effective_perms):
                    has_perm = True
                elif req_perm == "invoice:view" and ("invoice:approve" in effective_perms or "invoice:create" in effective_perms):
                    has_perm = True
                elif req_perm == "expense:view" and ("expense:approve" in effective_perms or "expense:create" in effective_perms):
                    has_perm = True
                elif req_perm == "budget:view" and "budget:manage" in effective_perms:
                    has_perm = True

            if not has_perm:
                continue

            # Append with computed scope
            scope_key = mod_slug
            card_scope = data_scopes.get(scope_key, "DEPARTMENT" if (is_finance_dept or is_hr_dept) else "ORGANIZATION")

            visible_cards.append({
                "id": card["id"],
                "title": card["title"],
                "module": card["module"],
                "required_permission": card["required_permission"],
                "size": card["size"],
                "position": len(visible_cards) + 1,
                "data_scope": card_scope,
                "category": card_category,
            })

        # Sort by position
        visible_cards.sort(key=lambda x: x["position"])

        # 7. Fetch Quick Metrics Tailored to Department Context
        metrics = {
            "department_name": user_dept.name if user_dept else ("Finance" if is_finance_dept else ("Human Resources" if is_hr_dept else "All Departments")),
            "total_users": 0,
            "total_documents": 0,
            "pending_leaves": 0,
            "pending_invoices": 0,
            "pending_expenses": 0,
            "today_attendance": "Present",
            "active_budgets_count": 0,
            "is_finance_focused": is_finance_dept,
            "is_hr_focused": is_hr_dept,
        }

        if org_id:
            try:
                # User count (department or org)
                u_stmt = select(func.count(User.id)).where(User.organization_id == org_id, User.is_active == True)
                metrics["total_users"] = (await db.scalar(u_stmt)) or 0

                # Document count
                d_stmt = select(func.count(Document.id)).where(Document.organization_id == org_id)
                metrics["total_documents"] = (await db.scalar(d_stmt)) or 0

                # HR pending leaves
                leave_cnt = await db.scalar(
                    select(func.count(LeaveRequest.id)).where(
                        LeaveRequest.organization_id == org_id,
                        LeaveRequest.status == "PENDING"
                    )
                )
                metrics["pending_leaves"] = leave_cnt or 0

                # Finance pending invoices
                inv_cnt = await db.scalar(
                    select(func.count(Invoice.id)).where(
                        Invoice.organization_id == org_id,
                        Invoice.approval_status == "PENDING"
                    )
                )
                metrics["pending_invoices"] = inv_cnt or 0

                # Finance pending expenses
                exp_cnt = await db.scalar(
                    select(func.count(Expense.id)).where(
                        Expense.organization_id == org_id,
                        Expense.status == "PENDING"
                    )
                )
                metrics["pending_expenses"] = exp_cnt or 0

                # Active budgets count
                b_cnt = await db.scalar(
                    select(func.count(Budget.id)).where(
                        Budget.organization_id == org_id,
                        Budget.status == "ACTIVE"
                    )
                )
                metrics["active_budgets_count"] = b_cnt or 0

            except Exception as e:
                logger.warning(f"Error fetching dashboard counts: {e}")

        return {
            "cards": visible_cards,
            "metrics": metrics,
            "data_scopes": data_scopes,
            "permissions": list(effective_perms),
            "department": {
                "id": str(user_dept.id) if user_dept else None,
                "name": user_dept.name if user_dept else None,
                "slug": user_dept.slug if user_dept else None,
            } if user_dept else None,
        }


dashboard_service = DashboardService()

