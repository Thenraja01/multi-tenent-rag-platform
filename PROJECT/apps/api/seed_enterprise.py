import asyncio
import os
import sys
import uuid
from datetime import datetime, date, timezone, timedelta
from decimal import Decimal

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, or_, text
from app.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.services.rag_service import SecureRAGService
from app.models.platform_models import PlatformAdmin, Plan, Pack, PackModule, Module, Permission
from app.models.organization_models import Organization, OrganizationSettings, OrganizationCustomDomain, OrganizationPack
from app.models.identity_models import User, Department, UserDepartment, Domain, DomainModule, Role, RolePermission, UserRole
from app.models.knowledge_models import Document, DocumentChunk, DocumentRole, DocumentUser, DocumentDepartment
from app.models.hr_models import Employee, EmployeeProfile, AttendanceRecord, LeaveRequest
from app.models.finance_models import Vendor, Invoice, Expense, Budget, Payment, FinancialReport


async def seed_enterprise():
    print("\n" + "=" * 80)
    print("  SEEDING 5 DEFAULT ROLES, DUAL DEPARTMENTS (HR & FINANCE), AND RAG KNOWLEDGE BASES")
    print("=" * 80 + "\n")

    async with AsyncSessionLocal() as db:
        # =========================================================================
        # 1. Platform SuperAdmin (Tier 1)
        # =========================================================================
        superadmin_email = "superadmin@localfix.app"
        sa_res = await db.execute(select(PlatformAdmin).where(PlatformAdmin.email == superadmin_email))
        superadmin = sa_res.scalar_one_or_none()
        if not superadmin:
            superadmin = PlatformAdmin(
                email=superadmin_email,
                full_name="Platform SuperAdmin",
                password_hash=hash_password("Test@123"),
                is_active=True,
            )
            db.add(superadmin)
            await db.flush()
            print(f"[+] Created Platform SuperAdmin: {superadmin.email} (Password: Test@123)")
        else:
            superadmin.password_hash = hash_password("Test@123")
            superadmin.is_active = True
            await db.flush()
            print(f"[*] Verified Platform SuperAdmin: {superadmin.email}")

        # =========================================================================
        # 2. Plans & Packs
        # =========================================================================
        plan_res = await db.execute(select(Plan).where(Plan.slug == "enterprise"))
        plan = plan_res.scalars().first()
        if not plan:
            plan = Plan(
                name="Enterprise Full Suite",
                slug="enterprise",
                max_users=1000,
                max_storage_bytes=500 * 1024 * 1024 * 1024,
                max_documents=20000,
                max_ai_tokens=1000000000,
                is_active=True,
            )
            db.add(plan)
            await db.flush()

        # Create Standard Packs: HR Pack & Finance Suite Pack & Enterprise Unified
        PACKS_CONFIG = [
            ("hr_pack", "HR Pack", "Human Resources, Attendance, Leave, Documents & AI Assistant"),
            ("finance_suite", "Finance Suite", "Finance & Accounting, Invoices, OCR, Expenses, Budgets & AI Assistant"),
            ("enterprise_unified", "Enterprise Unified Suite", "Unified HR, Finance, Operations, Legal & Platform AI"),
        ]

        packs_map = {}
        for p_slug, p_name, p_desc in PACKS_CONFIG:
            p_res = await db.execute(select(Pack).where(Pack.slug == p_slug))
            p_obj = p_res.scalars().first()
            if not p_obj:
                p_obj = Pack(slug=p_slug, name=p_name, description=p_desc, is_active=True)
                db.add(p_obj)
                await db.flush()
            packs_map[p_slug] = p_obj

        # Standard Modules
        ALL_MODULES = [
            # HR Modules
            ("hr_core", "HR Core", "hr", "Employee records and organizational hierarchy"),
            ("attendance", "Attendance", "hr", "Clock-in/out and shift tracking"),
            ("leave", "Leave", "hr", "Leave requests, vacation quotas and PTO balances"),
            ("hr_analytics", "HR Analytics", "hr", "Workforce retention and attendance analytics"),
            # Finance Modules
            ("finance_dashboard", "Finance Dashboard", "finance", "Real-time ledger, P&L, and balance sheet insights"),
            ("invoices", "Invoices & OCR", "finance", "Vendor invoices, automated scanning and payment approvals"),
            ("expense_claims", "Expense Claims", "finance", "Employee expense reimbursement tracking and policy checks"),
            # Universal Modules
            ("documents", "Documents & Zero-Trust ACL", "core", "Secure document storage, indexing and access control"),
            ("ai", "Nexus AI Copilot", "ai", "Zero-trust domain-isolated RAG assistant"),
            ("nexus", "Nexus Portal", "core", "Universal enterprise portal"),
            ("users", "User Directory", "admin", "User directory and role assignments"),
            ("roles", "RBAC & UBAC", "admin", "Role-based and user-based access control"),
            ("departments", "Department Management", "admin", "Department organization units"),
            ("settings", "Organization Settings", "admin", "Tenant configuration and security settings"),
        ]

        modules_map = {}
        for mod_slug, mod_name, mod_type, mod_desc in ALL_MODULES:
            m_res = await db.execute(select(Module).where(Module.slug == mod_slug))
            mod_obj = m_res.scalars().first()
            if not mod_obj:
                mod_obj = Module(slug=mod_slug, name=mod_name, module_type=mod_type, description=mod_desc, is_active=True)
                db.add(mod_obj)
                await db.flush()
            modules_map[mod_slug] = mod_obj

        # Bind Modules to Packs
        hr_pack_mods = ["hr_core", "attendance", "leave", "hr_analytics", "documents", "ai"]
        for m_slug in hr_pack_mods:
            m_id = modules_map[m_slug].id
            pm_res = await db.execute(select(PackModule).where(PackModule.pack_id == packs_map["hr_pack"].id, PackModule.module_id == m_id))
            if not pm_res.scalars().first():
                db.add(PackModule(pack_id=packs_map["hr_pack"].id, module_id=m_id, is_required=True))

        fin_pack_mods = ["finance_dashboard", "invoices", "expense_claims", "documents", "ai"]
        for m_slug in fin_pack_mods:
            m_id = modules_map[m_slug].id
            pm_res = await db.execute(select(PackModule).where(PackModule.pack_id == packs_map["finance_suite"].id, PackModule.module_id == m_id))
            if not pm_res.scalars().first():
                db.add(PackModule(pack_id=packs_map["finance_suite"].id, module_id=m_id, is_required=True))

        for m_slug in modules_map.keys():
            m_id = modules_map[m_slug].id
            pm_res = await db.execute(select(PackModule).where(PackModule.pack_id == packs_map["enterprise_unified"].id, PackModule.module_id == m_id))
            if not pm_res.scalars().first():
                db.add(PackModule(pack_id=packs_map["enterprise_unified"].id, module_id=m_id, is_required=True))

        await db.flush()

        # =========================================================================
        # 3. Permissions Catalog (RBAC & UBAC)
        # =========================================================================
        STANDARD_PERMISSIONS = [
            # Universal & Navigation
            ("dashboard", "view", "dashboard:view", "View dynamic operational dashboard"),
            ("audit", "view", "audit:view", "View security and compliance audit logs"),
            ("settings", "view", "settings:view", "View organization settings"),
            ("settings", "update", "settings:update", "Modify organization settings"),
            ("user", "view", "user:view", "View user roster"),
            ("user", "read", "user:read", "Read user details"),
            ("user", "create", "user:create", "Create and invite new users"),
            ("user", "update", "user:update", "Update user accounts"),
            ("user", "delete", "user:delete", "Deactivate or delete users"),
            ("role", "view", "role:view", "View RBAC roles"),
            ("role", "read", "role:read", "Read role permissions"),
            ("role", "create", "role:create", "Create custom roles"),
            ("role", "update", "role:update", "Update roles and permissions"),
            ("role", "delete", "role:delete", "Delete custom roles"),
            ("role", "manage", "role:manage", "Manage RBAC and UBAC matrices"),
            ("department", "view", "department:view", "View department organization units"),
            ("department", "create", "department:create", "Create departments"),
            ("domain", "view", "domain:view", "View domain workspaces"),

            # Documents & RAG
            ("document", "view", "document:view", "View accessible documents"),
            ("document", "read", "document:read", "Read document contents and summaries"),
            ("document", "upload", "document:upload", "Upload new domain documents"),
            ("document", "create", "document:create", "Create document entries"),
            ("document", "update", "document:update", "Update document metadata and ACLs"),
            ("document", "delete", "document:delete", "Delete documents"),
            ("document", "approve", "document:approve", "Approve and publish documents"),
            ("rag", "query", "rag:query", "Ask AI Copilot questions in authorized domains"),
            ("rag", "manage", "rag:manage", "Manage RAG vector indices and domain embeddings"),

            # HR Permissions
            ("attendance", "view", "attendance:view", "View attendance records"),
            ("attendance", "mark", "attendance:mark", "Clock-in / Clock-out attendance"),
            ("attendance", "update", "attendance:update", "Edit employee attendance logs"),
            ("attendance", "manage", "attendance:manage", "Manage organization attendance rules & geofencing"),
            ("leave", "view", "leave:view", "View leave balances and history"),
            ("leave", "create", "leave:create", "Apply for leave and time off"),
            ("leave", "apply", "leave:apply", "Apply for time off"),
            ("leave", "approve", "leave:approve", "Approve employee leave requests"),
            ("leave", "reject", "leave:reject", "Reject employee leave requests"),
            ("leave", "manage", "leave:manage", "Manage leave quotas, types, and policies"),
            ("employee", "view", "employee:view", "View employee profiles"),
            ("employee", "read", "employee:read", "Read employee records"),
            ("employee", "create", "employee:create", "Onboard new employee"),
            ("employee", "update", "employee:update", "Update employee records"),
            ("employee", "delete", "employee:delete", "Terminate/archive employee"),

            # Finance Permissions
            ("finance", "view", "finance:view", "View financial summaries and KPI dashboards"),
            ("finance", "manage", "finance:manage", "Manage financial operations and fiscal years"),
            ("invoice", "view", "invoice:view", "View vendor invoices and payment status"),
            ("invoice", "create", "invoice:create", "Create and upload vendor invoices"),
            ("invoice", "approve", "invoice:approve", "Approve or reject vendor invoices"),
            ("invoice", "pay", "invoice:pay", "Mark invoices as paid and issue payments"),
            ("expense", "view", "expense:view", "View expense claims"),
            ("expense", "create", "expense:create", "Submit employee expense reimbursement claims"),
            ("expense", "approve", "expense:approve", "Approve or reject employee expense claims"),
            ("budget", "view", "budget:view", "View department budget allocations and utilization"),
            ("budget", "create", "budget:create", "Create department budgets"),
            ("budget", "manage", "budget:manage", "Configure budget thresholds and alerts"),
            ("vendor", "view", "vendor:view", "View vendor directory"),
            ("vendor", "create", "vendor:create", "Add new vendor"),
            ("vendor", "manage", "vendor:manage", "Manage vendor contracts and payment terms"),
            ("financial_report", "view", "financial_report:view", "View P&L and Balance Sheet reports"),
            ("financial_report", "generate", "financial_report:generate", "Generate new financial statements"),
        ]

        for res, act, key, desc in STANDARD_PERMISSIONS:
            p_res = await db.execute(select(Permission).where(Permission.permission_key == key))
            if not p_res.scalars().first():
                db.add(Permission(resource=res, action=act, permission_key=key, description=desc))
        await db.flush()

        all_perms = {p.permission_key: p for p in (await db.execute(select(Permission))).scalars().all()}

        # =========================================================================
        # 4. Organization: Globex Corporation
        # =========================================================================
        org_res = await db.execute(select(Organization).where(Organization.slug == "globex"))
        org = org_res.scalars().first()
        if not org:
            org = Organization(
                name="Globex Corporation",
                slug="globex",
                plan_id=plan.id,
                status="ACTIVE",
            )
            db.add(org)
            await db.flush()
            print(f"[+] Created Organization: {org.name} (id: {org.id})")
        else:
            print(f"[*] Found Organization: {org.name} (id: {org.id})")

        # Organization Settings
        settings_res = await db.execute(select(OrganizationSettings).where(OrganizationSettings.organization_id == org.id))
        if not settings_res.scalars().first():
            db.add(OrganizationSettings(
                organization_id=org.id,
                mfa_required=False,
                password_login_enabled=True,
                session_timeout_minutes=120,
                allowed_email_domains=["globex.com", "gmail.com", "localfix.app"],
            ))

        # Organization Custom Domains
        hostnames = [
            "globex.localhost:3000",
            "hr.globex.localhost:3000",
            "finance.globex.localhost:3000",
            "globex.localfix.app",
        ]
        for host in hostnames:
            cd_res = await db.execute(select(OrganizationCustomDomain).where(
                OrganizationCustomDomain.organization_id == org.id,
                OrganizationCustomDomain.hostname == host
            ))
            if not cd_res.scalars().first():
                db.add(OrganizationCustomDomain(
                    organization_id=org.id,
                    hostname=host,
                    verification_status="VERIFIED",
                    is_primary=(host == "globex.localhost:3000"),
                    verified_at=datetime.now(timezone.utc),
                ))

        # Assign Enterprise Unified Pack to Globex
        for p_slug in ["hr_pack", "finance_suite", "enterprise_unified"]:
            pack_obj = packs_map[p_slug]
            op_res = await db.execute(select(OrganizationPack).where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.pack_id == pack_obj.id,
            ))
            if not op_res.scalars().first():
                db.add(OrganizationPack(
                    organization_id=org.id,
                    pack_id=pack_obj.id,
                    is_active=True,
                    assigned_at=datetime.now(timezone.utc),
                ))

        await db.flush()

        # =========================================================================
        # 5. Distinct Departments & Domains (HR & Finance Separation)
        # =========================================================================
        # A. HR Department & Domain
        hr_dept_res = await db.execute(select(Department).where(Department.organization_id == org.id, Department.slug == "hr-dept"))
        hr_dept = hr_dept_res.scalars().first()
        if not hr_dept:
            hr_dept = Department(
                organization_id=org.id,
                name="Human Resources",
                slug="hr-dept",
                description="People Operations, Talent Acquisition, Leaves & Benefits",
                status="ACTIVE",
            )
            db.add(hr_dept)
            await db.flush()

        hr_domain_res = await db.execute(select(Domain).where(Domain.organization_id == org.id, Domain.slug == "hr"))
        hr_domain = hr_domain_res.scalars().first()
        if not hr_domain:
            hr_domain = Domain(
                organization_id=org.id,
                name="Human Resources",
                slug="hr",
                description="Globex HR Policy, Employee Handbook, Benefits & RAG AI Knowledge Base",
                status="ACTIVE",
            )
            db.add(hr_domain)
            await db.flush()

        # B. Finance Department & Domain
        fin_dept_res = await db.execute(select(Department).where(Department.organization_id == org.id, Department.slug == "finance-dept"))
        fin_dept = fin_dept_res.scalars().first()
        if not fin_dept:
            fin_dept = Department(
                organization_id=org.id,
                name="Finance & Accounting",
                slug="finance-dept",
                description="Corporate Finance, Invoicing, Payroll, Expenses & Budget Control",
                status="ACTIVE",
            )
            db.add(fin_dept)
            await db.flush()

        fin_domain_res = await db.execute(select(Domain).where(Domain.organization_id == org.id, Domain.slug == "finance"))
        fin_domain = fin_domain_res.scalars().first()
        if not fin_domain:
            fin_domain = Domain(
                organization_id=org.id,
                name="Finance & Accounting",
                slug="finance",
                description="Financial Ledgers, Procurement Policies, Budget Guidelines & Finance Copilot",
                status="ACTIVE",
            )
            db.add(fin_domain)
            await db.flush()

        # =========================================================================
        # 6. Five Default Role Tiers Definition
        # =========================================================================
        ROLES_DEFINITIONS = [
            # Tier 2: Organization Admin
            {
                "slug": "org_admin",
                "name": "Organization Administrator",
                "domain_id": None,
                "description": "Full administrative control across all departments, domains, billing, and settings in the organization.",
                "perms": [p for p in all_perms.keys()],
            },
            # Tier 3: Department Admin (HR & Finance)
            {
                "slug": "hr_admin",
                "name": "HR Department Admin",
                "domain_id": hr_domain.id,
                "description": "Full administrative control over HR department, onboarding, leaves, attendance rules, and HR RAG.",
                "perms": [
                    "dashboard:view",
                    "attendance:view", "attendance:mark", "attendance:update", "attendance:manage",
                    "leave:view", "leave:create", "leave:apply", "leave:approve", "leave:reject", "leave:manage",
                    "employee:view", "employee:read", "employee:create", "employee:update", "employee:delete",
                    "document:view", "document:read", "document:upload", "document:create", "document:update", "document:delete", "document:approve",
                    "rag:query", "rag:manage",
                    "user:view", "user:read", "user:create", "user:update",
                    "role:view", "role:read",
                    "department:view", "domain:view",
                ],
            },
            {
                "slug": "finance_admin",
                "name": "Finance Department Admin",
                "domain_id": fin_domain.id,
                "description": "Full administrative control over Finance department, ledger, invoices, expenses, budgets, and Finance RAG.",
                "perms": [
                    "dashboard:view",
                    "finance:view", "finance:manage",
                    "invoice:view", "invoice:create", "invoice:approve", "invoice:pay",
                    "expense:view", "expense:create", "expense:approve",
                    "budget:view", "budget:create", "budget:manage",
                    "vendor:view", "vendor:create", "vendor:manage",
                    "financial_report:view", "financial_report:generate",
                    "document:view", "document:read", "document:upload", "document:create", "document:update", "document:delete", "document:approve",
                    "rag:query", "rag:manage",
                    "user:view", "user:read",
                    "department:view", "domain:view",
                ],
            },
            # Tier 4: Department Manager (HR & Finance)
            {
                "slug": "hr_manager",
                "name": "HR Department Manager",
                "domain_id": hr_domain.id,
                "description": "People manager responsible for team attendance, approving leave requests, and reviewing department docs.",
                "perms": [
                    "dashboard:view",
                    "attendance:view", "attendance:mark",
                    "leave:view", "leave:create", "leave:apply", "leave:approve", "leave:reject",
                    "employee:view", "employee:read",
                    "document:view", "document:read", "document:upload",
                    "rag:query",
                    "department:view", "domain:view",
                ],
            },
            {
                "slug": "finance_manager",
                "name": "Finance Department Manager",
                "domain_id": fin_domain.id,
                "description": "Finance manager responsible for approving invoices, approving employee expense claims, and budget tracking.",
                "perms": [
                    "dashboard:view",
                    "finance:view",
                    "invoice:view", "invoice:approve",
                    "expense:view", "expense:approve",
                    "budget:view",
                    "vendor:view",
                    "financial_report:view",
                    "document:view", "document:read", "document:upload",
                    "rag:query",
                    "department:view", "domain:view",
                ],
            },
            # Tier 5: Department Employee (HR & Finance)
            {
                "slug": "hr_employee",
                "name": "HR Department Employee",
                "domain_id": hr_domain.id,
                "description": "HR staff self-service: clock attendance, apply for leave, view handbook, and ask HR Copilot.",
                "perms": [
                    "dashboard:view",
                    "attendance:view", "attendance:mark",
                    "leave:view", "leave:create", "leave:apply",
                    "document:view", "document:read",
                    "rag:query",
                ],
            },
            {
                "slug": "finance_employee",
                "name": "Finance Department Employee",
                "domain_id": fin_domain.id,
                "description": "Finance staff/accountant self-service: submit expense receipts, view invoice status, and ask Finance Copilot.",
                "perms": [
                    "dashboard:view",
                    "finance:view",
                    "invoice:view", "invoice:create",
                    "expense:view", "expense:create",
                    "budget:view",
                    "document:view", "document:read",
                    "rag:query",
                ],
            },
        ]

        roles_map = {}
        for rd in ROLES_DEFINITIONS:
            r_res = await db.execute(select(Role).where(
                Role.organization_id == org.id,
                Role.slug == rd["slug"],
            ))
            role_obj = r_res.scalars().first()
            if not role_obj:
                role_obj = Role(
                    organization_id=org.id,
                    domain_id=rd["domain_id"],
                    name=rd["name"],
                    slug=rd["slug"],
                    description=rd["description"],
                    is_system=True,
                    is_active=True,
                )
                db.add(role_obj)
                await db.flush()
                print(f"[+] Created Role: {role_obj.name} (slug: {role_obj.slug})")
            else:
                role_obj.name = rd["name"]
                role_obj.description = rd["description"]
                role_obj.domain_id = rd["domain_id"]
                await db.flush()

            roles_map[rd["slug"]] = role_obj

            # Sync permissions to role
            for p_key in rd["perms"]:
                p_obj = all_perms.get(p_key)
                if p_obj:
                    rp_res = await db.execute(select(RolePermission).where(
                        RolePermission.role_id == role_obj.id,
                        RolePermission.permission_id == p_obj.id,
                    ))
                    if not rp_res.scalars().first():
                        db.add(RolePermission(role_id=role_obj.id, permission_id=p_obj.id))

        await db.flush()

        # =========================================================================
        # 7. Seed Users across the 5 Role Tiers and Departments
        # =========================================================================
        USERS_CONFIG = [
            # Tier 2: Organization Admin
            {
                "email": "admin@globex.com",
                "name": "Globex Executive Admin",
                "password": "Password123!",
                "is_admin": True,
                "role_slug": "org_admin",
                "dept_id": hr_dept.id,
            },
            {
                "email": "hrglobex@gmail.com",
                "name": "Globex Chief Admin",
                "password": "Password123!",
                "is_admin": True,
                "role_slug": "org_admin",
                "dept_id": hr_dept.id,
            },
            # Tier 3: Department Admins
            {
                "email": "hr.admin@globex.com",
                "name": "Sarah Connor (HR Admin)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_admin",
                "dept_id": hr_dept.id,
            },
            {
                "email": "finance.admin@globex.com",
                "name": "Arthur Pendelton (Finance Admin)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "finance_admin",
                "dept_id": fin_dept.id,
            },
            # Tier 4: Department Managers
            {
                "email": "hr.manager@globex.com",
                "name": "Elena Rostova (HR Manager)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_manager",
                "dept_id": hr_dept.id,
            },
            {
                "email": "finance.manager@globex.com",
                "name": "Marcus Vance (Finance Manager)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "finance_manager",
                "dept_id": fin_dept.id,
            },
            # Tier 5: Department Employees
            {
                "email": "hr.employee@globex.com",
                "name": "Jane Doe (HR Employee)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_employee",
                "dept_id": hr_dept.id,
            },
            {
                "email": "empglobex@gmail.com",
                "name": "Jane Doe (HR Employee Alias)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_employee",
                "dept_id": hr_dept.id,
            },
            {
                "email": "finance.employee@globex.com",
                "name": "David Chen (Financial Analyst)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "finance_employee",
                "dept_id": fin_dept.id,
            },
        ]

        users_map = {}
        for uc in USERS_CONFIG:
            u_res = await db.execute(select(User).where(
                User.organization_id == org.id,
                User.email == uc["email"],
            ))
            u_obj = u_res.scalars().first()
            if not u_obj:
                u_obj = User(
                    organization_id=org.id,
                    email=uc["email"],
                    full_name=uc["name"],
                    password_hash=hash_password(uc["password"]),
                    is_active=True,
                    is_org_admin=uc["is_admin"],
                    email_verified=True,
                )
                db.add(u_obj)
                await db.flush()
                print(f"[+] Created User: {u_obj.email} ({u_obj.full_name}) -> Role: {uc['role_slug']}")
            else:
                u_obj.full_name = uc["name"]
                u_obj.password_hash = hash_password(uc["password"])
                u_obj.is_active = True
                u_obj.is_org_admin = uc["is_admin"]
                await db.flush()

            users_map[uc["email"]] = u_obj

            # Bind Department
            ud_res = await db.execute(select(UserDepartment).where(
                UserDepartment.user_id == u_obj.id,
                UserDepartment.department_id == uc["dept_id"],
            ))
            if not ud_res.scalars().first():
                db.add(UserDepartment(user_id=u_obj.id, department_id=uc["dept_id"], is_primary=True))

            # Bind Role
            target_role = roles_map.get(uc["role_slug"])
            if target_role:
                ur_res = await db.execute(select(UserRole).where(
                    UserRole.user_id == u_obj.id,
                    UserRole.role_id == target_role.id,
                ))
                if not ur_res.scalars().first():
                    db.add(UserRole(user_id=u_obj.id, role_id=target_role.id))

        await db.flush()

        # =========================================================================
        # 8. Seed Employee Records & Attendance / Leaves for HR Department
        # =========================================================================
        hr_admin_user = users_map["hr.admin@globex.com"]
        hr_mgr_user = users_map["hr.manager@globex.com"]
        hr_emp_user = users_map["hr.employee@globex.com"]

        # Employees
        emp_configs = [
            (hr_admin_user, "GLX-HR-001", "Director of People Operations"),
            (hr_mgr_user, "GLX-HR-002", "HR Operations Manager"),
            (hr_emp_user, "GLX-HR-003", "People Experience Specialist"),
            (users_map["finance.admin@globex.com"], "GLX-FIN-001", "Chief Financial Officer"),
            (users_map["finance.manager@globex.com"], "GLX-FIN-002", "Finance Controller"),
            (users_map["finance.employee@globex.com"], "GLX-FIN-003", "Senior Accountant"),
        ]

        emp_objs = {}
        for u, code, title in emp_configs:
            emp_res = await db.execute(select(Employee).where(Employee.organization_id == org.id, Employee.employee_code == code))
            emp = emp_res.scalars().first()
            if not emp:
                emp = Employee(
                    organization_id=org.id,
                    user_id=u.id,
                    department_id=hr_dept.id if "HR" in code else fin_dept.id,
                    employee_code=code,
                    employment_status="ACTIVE",
                    joining_date=date(2023, 1, 15),
                )
                db.add(emp)
                await db.flush()
                db.add(EmployeeProfile(employee_id=emp.id, job_title=title, location="Headquarters (Bengaluru)"))
            emp_objs[code] = emp

        await db.flush()

        # Attendance Records for HR & Finance staff
        today = date.today()
        for emp_code, emp in emp_objs.items():
            for day_offset in range(5):
                att_date = today - timedelta(days=day_offset)
                if att_date.weekday() < 5:  # Weekday
                    att_res = await db.execute(select(AttendanceRecord).where(
                        AttendanceRecord.employee_id == emp.id,
                        AttendanceRecord.attendance_date == att_date,
                    ))
                    if not att_res.scalars().first():
                        db.add(AttendanceRecord(
                            organization_id=org.id,
                            employee_id=emp.id,
                            attendance_date=att_date,
                            check_in=datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=9, minutes=15),
                            check_out=datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=18, minutes=30),
                            status="PRESENT",
                            geofence_verified=True,
                        ))

        # Leave Requests
        hr_emp = emp_objs["GLX-HR-003"]
        leave_res = await db.execute(select(LeaveRequest).where(
            LeaveRequest.organization_id == org.id,
            LeaveRequest.employee_id == hr_emp.id,
        ))
        if not leave_res.scalars().first():
            db.add(LeaveRequest(
                organization_id=org.id,
                employee_id=hr_emp.id,
                leave_type="Annual Vacation",
                start_date=today + timedelta(days=5),
                end_date=today + timedelta(days=7),
                total_days=Decimal("3.0"),
                reason="Family vacation and wellness trip",
                status="PENDING",
            ))
            db.add(LeaveRequest(
                organization_id=org.id,
                employee_id=hr_emp.id,
                leave_type="Sick Leave",
                start_date=today - timedelta(days=12),
                end_date=today - timedelta(days=11),
                total_days=Decimal("1.0"),
                reason="Medical recovery",
                status="APPROVED",
                approved_by=hr_mgr_user.id,
                approved_at=datetime.now(timezone.utc) - timedelta(days=12),
            ))

        # =========================================================================
        # 9. Seed Operational Data for Finance Department (Vendors, Invoices, Expenses, Budgets)
        # =========================================================================
        # Vendors
        vendors_config = [
            ("CloudTech Infrastructure", "VND-AWS-01", "GSTIN29ABCDE1234F1Z5", "Sarah Jenkins", "sarah@cloudtech.io", "Cloud & DevOps"),
            ("OfficePro Supplies Ltd", "VND-OFF-02", "GSTIN33XYZAB5678C2D4", "Michael Scott", "sales@officepro.com", "Office Supplies"),
            ("Apex Global Consulting", "VND-APX-03", "GSTIN27QWERT9876H3K8", "Priya Nair", "contact@apexconsulting.com", "Legal & Advisory"),
        ]
        vendors_map = {}
        for name, code, tax_id, contact, email, cat in vendors_config:
            v_res = await db.execute(select(Vendor).where(Vendor.organization_id == org.id, Vendor.code == code))
            v_obj = v_res.scalars().first()
            if not v_obj:
                v_obj = Vendor(
                    organization_id=org.id,
                    name=name,
                    code=code,
                    tax_id=tax_id,
                    contact_person=contact,
                    email=email,
                    category=cat,
                    payment_terms_days=30,
                    status="ACTIVE",
                )
                db.add(v_obj)
                await db.flush()
            vendors_map[code] = v_obj

        # Invoices
        invoices_config = [
            (vendors_map["VND-AWS-01"], "INV-2026-0891", Decimal("420000.00"), today + timedelta(days=10), "PENDING", "PENDING"),
            (vendors_map["VND-OFF-02"], "INV-2026-0412", Decimal("65000.00"), today - timedelta(days=5), "OVERDUE", "APPROVED"),
            (vendors_map["VND-APX-03"], "INV-2026-0105", Decimal("185000.00"), today - timedelta(days=20), "PAID", "APPROVED"),
        ]
        for v, inv_num, amt, due, pay_status, app_status in invoices_config:
            inv_res = await db.execute(select(Invoice).where(Invoice.organization_id == org.id, Invoice.invoice_number == inv_num))
            if not inv_res.scalars().first():
                db.add(Invoice(
                    organization_id=org.id,
                    vendor_id=v.id,
                    vendor_name=v.name,
                    invoice_number=inv_num,
                    invoice_date=today - timedelta(days=15),
                    due_date=due,
                    currency="INR",
                    subtotal_amount=amt * Decimal("0.82"),
                    tax_amount=amt * Decimal("0.18"),
                    total_amount=amt,
                    payment_status=pay_status,
                    approval_status=app_status,
                    approved_by=users_map["finance.manager@globex.com"].id if app_status == "APPROVED" else None,
                    approved_at=datetime.now(timezone.utc) - timedelta(days=10) if app_status == "APPROVED" else None,
                    line_items=[{"description": f"{v.category} Service Provision", "amount": float(amt)}],
                ))

        # Expenses
        expenses_config = [
            ("David Chen", Decimal("14500.00"), "Software Subscriptions", "JetBrains & Figma Enterprise licenses", "PENDING", users_map["finance.employee@globex.com"]),
            ("Jane Doe", Decimal("8200.00"), "Travel & Meals", "HR Onboarding conference travel", "APPROVED", users_map["hr.employee@globex.com"]),
            ("Marcus Vance", Decimal("22000.00"), "Client Entertainment", "Annual statutory audit dinner with KPMG", "APPROVED", users_map["finance.manager@globex.com"]),
        ]
        for emp_name, amt, cat, title, status_val, u_obj in expenses_config:
            exp_res = await db.execute(select(Expense).where(Expense.organization_id == org.id, Expense.title == title))
            if not exp_res.scalars().first():
                db.add(Expense(
                    organization_id=org.id,
                    user_id=u_obj.id,
                    department_id=fin_dept.id if "David" in emp_name or "Marcus" in emp_name else hr_dept.id,
                    employee_name=emp_name,
                    title=title,
                    category=cat,
                    amount=amt,
                    currency="INR",
                    expense_date=today - timedelta(days=3),
                    status=status_val,
                    approved_by=users_map["finance.manager@globex.com"].id if status_val == "APPROVED" else None,
                    approved_at=datetime.now(timezone.utc) - timedelta(days=2) if status_val == "APPROVED" else None,
                ))

        # Department Budgets with Alert Thresholds
        budgets_config = [
            (hr_dept.id, "Human Resources", Decimal("5000000.00"), Decimal("3800000.00"), Decimal("80.0")),  # 76%
            (fin_dept.id, "Finance & Accounting", Decimal("8000000.00"), Decimal("6900000.00"), Decimal("80.0")), # 86.25% (Warning)
            (None, "Engineering & Tech", Decimal("25000000.00"), Decimal("21500000.00"), Decimal("80.0")),      # 86% (Warning)
            (None, "Sales & Marketing", Decimal("18000000.00"), Decimal("12000000.00"), Decimal("80.0")),       # 66%
        ]
        for d_id, d_name, alloc, spent, thresh in budgets_config:
            b_res = await db.execute(select(Budget).where(
                Budget.organization_id == org.id,
                Budget.department_name == d_name,
                Budget.fiscal_year == "2025-2026",
            ))
            if not b_res.scalars().first():
                db.add(Budget(
                    organization_id=org.id,
                    department_id=d_id,
                    department_name=d_name,
                    fiscal_year="2025-2026",
                    period="ANNUAL",
                    allocated_amount=alloc,
                    spent_amount=spent,
                    currency="INR",
                    alert_threshold_pct=thresh,
                    status="ACTIVE",
                ))

        await db.flush()

        # =========================================================================
        # 10. Seed Domain Documents & Vector Embeddings (HR vs Finance Isolation)
        # =========================================================================
        # Document 1: HR Policy & Employee Handbook (HR Domain ONLY)
        hr_doc_name = "globex_hr_handbook_2026.txt"
        hr_storage_key = f"organizations/{org.id}/domains/{hr_domain.id}/documents/{hr_doc_name}"
        hr_doc_res = await db.execute(select(Document).where(Document.organization_id == org.id, Document.domain_id == hr_domain.id, Document.filename == hr_doc_name))
        hr_doc = hr_doc_res.scalars().first()

        hr_content = """# GLOBEX CORPORATION — HR EMPLOYEE HANDBOOK (2026)

## 1. Company Culture and Code of Conduct
Globex Corporation upholds the highest standards of innovation, integrity, and inclusivity. Every employee is entitled to a respectful and harassment-free workplace.

## 2. Paid Time Off (PTO) & Leave Entitlements
- **Annual Vacation Leave:** 20 paid vacation days per calendar year.
- **Sick and Medical Leave:** 10 paid wellness days annually.
- **Parental Leave:** 16 weeks of 100% paid leave for primary caregivers.
- **Bereavement Leave:** 5 paid days for immediate family members.
- **Application Process:** All leave requests must be logged via Nexus HR portal and approved by the department manager.

## 3. Hybrid Work Policy & Hours
- Core business collaboration hours are 10:00 AM to 4:00 PM local time.
- Mondays and Fridays are remote-optional collaboration days.
- In-office attendance on Tuesdays, Wednesdays, and Thursdays is tracked via the Nexus geofence mobile check-in.

## 4. Performance & Career Reviews
- Biannual performance evaluations occur in June and December.
- Annual compensation adjustments take effect on January 1st based on OKR achievements.
"""

        if not hr_doc:
            hr_doc = Document(
                organization_id=org.id,
                domain_id=hr_domain.id,
                uploaded_by=hr_admin_user.id,
                filename=hr_doc_name,
                storage_key=hr_storage_key,
                mime_type="text/plain",
                file_size=len(hr_content.encode("utf-8")),
                status="READY",
                page_count=2,
                chunk_count=4,
                metadata_json={"title": "Globex HR Handbook 2026", "department": "Human Resources", "confidentiality": "Internal"},
            )
            db.add(hr_doc)
            await db.flush()

            # Chunks & Embeddings
            for idx, section in enumerate(hr_content.split("\n\n## ")):
                chunk_text = section if idx == 0 else f"## {section}"
                emb = await SecureRAGService.get_embedding(chunk_text)
                db.add(DocumentChunk(
                    document_id=hr_doc.id,
                    chunk_index=idx,
                    content=chunk_text.strip(),
                    embedding=emb,
                    chunk_metadata={"section": idx, "domain": "hr"},
                    page_number=1,
                ))

            # ACL: Restricted to HR roles and HR department
            for r_slug in ["org_admin", "hr_admin", "hr_manager", "hr_employee"]:
                db.add(DocumentRole(
                    document_id=hr_doc.id,
                    role_id=roles_map[r_slug].id,
                    access_level="ADMIN" if "admin" in r_slug else "READ",
                ))
            db.add(DocumentDepartment(document_id=hr_doc.id, department_id=hr_dept.id, access_level="READ"))

        # Document 2: Finance & Procurement Policy (Finance Domain ONLY)
        fin_doc_name = "globex_finance_procurement_policy_2026.txt"
        fin_storage_key = f"organizations/{org.id}/domains/{fin_domain.id}/documents/{fin_doc_name}"
        fin_doc_res = await db.execute(select(Document).where(Document.organization_id == org.id, Document.domain_id == fin_domain.id, Document.filename == fin_doc_name))
        fin_doc = fin_doc_res.scalars().first()

        fin_content = """# GLOBEX CORPORATION — FINANCE & PROCUREMENT POLICY (2026)

## 1. Vendor Invoice Submission and 3-Way Matching
- All vendor invoices must be submitted in PDF format to `finance.admin@globex.com` or uploaded via the Nexus Finance OCR Portal.
- Invoices above ₹1,00,000 require purchase order (PO) verification and 3-way matching before release.
- Standard invoice payment terms are Net-30 days from automated ledger registration.

## 2. Employee Expense Claims & Travel Allowances
- Expense reimbursements must be submitted within 30 days of expense occurrence with digital tax receipts.
- Daily meal allowance while traveling: up to ₹2,500 per day.
- Domestic flights must be booked in Economy Class at least 7 days in advance.
- Expenses exceeding ₹10,000 require Finance Manager approval; expenses above ₹50,000 require Finance Director approval.

## 3. Department Budget Allocation & Variance Controls
- Departments must operate within their approved annual fiscal allocation.
- Automatic warning alerts trigger when departmental spend reaches 80% of budget allocation.
- Any budget overage above 100% requires emergency executive sign-off from the CFO.

## 4. GST & Tax Compliance
- All commercial vendor engagements must furnish valid GSTIN and 1099/W9 tax credentials.
- Input Tax Credit (ITC) reconciliation runs on the 20th of every month.
"""

        if not fin_doc:
            fin_doc = Document(
                organization_id=org.id,
                domain_id=fin_domain.id,
                uploaded_by=users_map["finance.admin@globex.com"].id,
                filename=fin_doc_name,
                storage_key=fin_storage_key,
                mime_type="text/plain",
                file_size=len(fin_content.encode("utf-8")),
                status="READY",
                page_count=2,
                chunk_count=4,
                metadata_json={"title": "Globex Finance Procurement Policy 2026", "department": "Finance", "confidentiality": "Confidential-Finance"},
            )
            db.add(fin_doc)
            await db.flush()

            # Chunks & Embeddings
            for idx, section in enumerate(fin_content.split("\n\n## ")):
                chunk_text = section if idx == 0 else f"## {section}"
                emb = await SecureRAGService.get_embedding(chunk_text)
                db.add(DocumentChunk(
                    document_id=fin_doc.id,
                    chunk_index=idx,
                    content=chunk_text.strip(),
                    embedding=emb,
                    chunk_metadata={"section": idx, "domain": "finance"},
                    page_number=1,
                ))

            # ACL: Restricted to Finance roles and Finance department
            for r_slug in ["org_admin", "finance_admin", "finance_manager", "finance_employee"]:
                db.add(DocumentRole(
                    document_id=fin_doc.id,
                    role_id=roles_map[r_slug].id,
                    access_level="ADMIN" if "admin" in r_slug else "READ",
                ))
            db.add(DocumentDepartment(document_id=fin_doc.id, department_id=fin_dept.id, access_level="READ"))

        await db.commit()

        print("\n" + "=" * 80)
        print("  ENTERPRISE SEEDING COMPLETE! ALL 5 DEFAULT ROLE TIERS SEEDED:")
        print("=" * 80)
        print("\n[TIER 1: PLATFORM SUPERADMIN]")
        print("  - Email:    superadmin@localfix.app / Test@123")
        print("  - Scope:    Global Cross-Tenant Platform Control (*)")
        print("\n[TIER 2: ORGANIZATION ADMIN]")
        print("  - Email:    admin@globex.com / Password123!")
        print("  - Scope:    Globex Tenant Owner (All HR & Finance Modules & Settings)")
        print("\n[TIER 3: DEPARTMENT ADMINS]")
        print("  - HR Admin:       hr.admin@globex.com / Password123! (HR Dept Focus)")
        print("  - Finance Admin:  finance.admin@globex.com / Password123! (Finance Dept Focus)")
        print("\n[TIER 4: DEPARTMENT MANAGERS]")
        print("  - HR Manager:       hr.manager@globex.com / Password123! (Leave Approvals & Team)")
        print("  - Finance Manager:  finance.manager@globex.com / Password123! (Invoice/Expense Approvals)")
        print("\n[TIER 5: DEPARTMENT EMPLOYEES]")
        print("  - HR Employee:       hr.employee@globex.com / Password123! (Self-Service Attendance & Leaves)")
        print("  - Finance Employee:  finance.employee@globex.com / Password123! (Self-Service Expense Claims)")
        print("\n[SEPARATED DEPARTMENTS & DOMAINS]")
        print("  1. Human Resources:        Domain='hr', Dept='hr-dept', Docs='globex_hr_handbook_2026.txt'")
        print("  2. Finance & Accounting:   Domain='finance', Dept='finance-dept', Docs='globex_finance_procurement_policy_2026.txt'")
        print("=" * 80 + "\n")


if __name__ == "__main__":
    asyncio.run(seed_enterprise())
