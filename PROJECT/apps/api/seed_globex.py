import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, or_, text
from app.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.services.rag_service import SecureRAGService
from app.models.platform_models import Plan, Pack, PackModule, Module, Permission
from app.models.organization_models import Organization, OrganizationSettings, OrganizationCustomDomain, OrganizationPack
from app.models.identity_models import User, Department, UserDepartment, Domain, DomainModule, Role, RolePermission, UserRole
from app.models.knowledge_models import Document, DocumentChunk, DocumentRole, DocumentUser


async def seed_globex():
    print("\n" + "=" * 70)
    print("  SEEDING GLOBEX CORPORATION (HR PACK, ROLES, USERS, RAG DOCUMENT)")
    print("=" * 70 + "\n")

    async with AsyncSessionLocal() as db:
        # 1. Ensure Standard Plan exists
        plan_res = await db.execute(select(Plan).where(Plan.slug == "enterprise"))
        plan = plan_res.scalars().first()
        if not plan:
            plan_res = await db.execute(select(Plan).where(Plan.is_active == True))
            plan = plan_res.scalars().first()
        if not plan:
            plan = Plan(
                name="Enterprise Plan",
                slug="enterprise",
                max_users=500,
                max_storage_bytes=100 * 1024 * 1024 * 1024,
                max_documents=5000,
                max_ai_tokens=100000000,
                is_active=True,
            )
            db.add(plan)
            await db.flush()

        # 2. Ensure HR Pack and its Modules exist
        hr_pack_res = await db.execute(select(Pack).where(Pack.slug == "hr_pack"))
        hr_pack = hr_pack_res.scalars().first()
        if not hr_pack:
            hr_pack = Pack(
                name="HR Pack",
                slug="hr_pack",
                description="Comprehensive Human Resources Management, Attendance, Leave, Documents & AI Assistant",
                is_active=True,
            )
            db.add(hr_pack)
            await db.flush()

        # Seed Pack Modules
        HR_MODULES = [
            ("attendance", "Attendance", "hr", "Clock-in and attendance logs"),
            ("leave", "Leave", "hr", "Leave requests and PTO balances"),
            ("documents", "Documents", "core", "Document management & zero-trust ACL"),
            ("ai", "Nexus AI", "ai", "AI Copilot and RAG vector intelligence"),
        ]

        for mod_slug, mod_name, mod_type, mod_desc in HR_MODULES:
            m_res = await db.execute(select(Module).where(Module.slug == mod_slug))
            mod_obj = m_res.scalars().first()
            if not mod_obj:
                mod_obj = Module(
                    slug=mod_slug,
                    name=mod_name,
                    module_type=mod_type,
                    description=mod_desc,
                    is_active=True,
                )
                db.add(mod_obj)
                await db.flush()

            pm_res = await db.execute(
                select(PackModule).where(
                    PackModule.pack_id == hr_pack.id,
                    PackModule.module_id == mod_obj.id,
                )
            )
            if not pm_res.scalars().first():
                db.add(PackModule(pack_id=hr_pack.id, module_id=mod_obj.id, is_required=True))

        await db.flush()

        # 3. Create or Fetch Globex Organization
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
            print(f"Created Organization: {org.name} (id: {org.id}, slug: {org.slug})")
        else:
            print(f"Using Existing Organization: {org.name} (id: {org.id})")

        # 4. Organization Settings
        settings_res = await db.execute(select(OrganizationSettings).where(OrganizationSettings.organization_id == org.id))
        org_settings = settings_res.scalars().first()
        if not org_settings:
            org_settings = OrganizationSettings(
                organization_id=org.id,
                mfa_required=False,
                password_login_enabled=True,
                session_timeout_minutes=120,
                allowed_email_domains=["globex.com", "gmail.com"],
            )
            db.add(org_settings)

        # 5. Bind Custom Domains for Globex
        hostnames = [
            "hr.globex.localhost:3000",
            "globex.localhost:3000",
            "hr.globex",
            "globex.localfix.app",
        ]
        for host in hostnames:
            cd_res = await db.execute(
                select(OrganizationCustomDomain).where(
                    OrganizationCustomDomain.organization_id == org.id,
                    OrganizationCustomDomain.hostname == host,
                )
            )
            if not cd_res.scalars().first():
                db.add(
                    OrganizationCustomDomain(
                        organization_id=org.id,
                        hostname=host,
                        verification_status="VERIFIED",
                        is_primary=(host == "hr.globex.localhost:3000"),
                        verified_at=datetime.now(timezone.utc),
                    )
                )

        # 6. Assign HR Pack to Globex
        op_res = await db.execute(
            select(OrganizationPack).where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.pack_id == hr_pack.id,
            )
        )
        if not op_res.scalars().first():
            db.add(
                OrganizationPack(
                    organization_id=org.id,
                    pack_id=hr_pack.id,
                    is_active=True,
                    assigned_at=datetime.now(timezone.utc),
                )
            )

        # 7. Create Department: Human Resources
        dept_res = await db.execute(
            select(Department).where(
                Department.organization_id == org.id,
                Department.slug == "hr-dept",
            )
        )
        dept = dept_res.scalars().first()
        if not dept:
            dept = Department(
                organization_id=org.id,
                name="Human Resources",
                slug="hr-dept",
                description="People Operations, Talent Acquisition, and Employee Benefits",
                status="ACTIVE",
            )
            db.add(dept)
            await db.flush()

        # 8. Create Domain Workspace: Human Resources (HR Knowledge & RAG Base)
        domain_res = await db.execute(
            select(Domain).where(
                Domain.organization_id == org.id,
                Domain.slug == "hr",
            )
        )
        hr_domain = domain_res.scalars().first()
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
            print(f"Created Domain: {hr_domain.name} (slug: {hr_domain.slug})")

        # 9. Ensure Atomic Permissions exist in permissions catalog
        STANDARD_PERMISSIONS = [
            ("dashboard", "view", "dashboard:view", "View dashboard and operational overview"),
            ("attendance", "view", "attendance:view", "View attendance records"),
            ("attendance", "mark", "attendance:mark", "Clock-in / Clock-out attendance"),
            ("attendance", "update", "attendance:update", "Edit attendance logs"),
            ("attendance", "manage", "attendance:manage", "Manage organization attendance rules"),
            ("leave", "view", "leave:view", "View leave balances and history"),
            ("leave", "create", "leave:create", "Apply for leave and time off"),
            ("leave", "apply", "leave:apply", "Apply for time off"),
            ("leave", "approve", "leave:approve", "Approve or reject employee leave requests"),
            ("leave", "reject", "leave:reject", "Reject employee leave requests"),
            ("leave", "manage", "leave:manage", "Manage leave quotas and policies"),
            ("document", "view", "document:view", "View accessible documents"),
            ("document", "read", "document:read", "Read document contents"),
            ("document", "upload", "document:upload", "Upload new documents"),
            ("document", "create", "document:create", "Create document entries"),
            ("document", "update", "document:update", "Update document metadata and ACLs"),
            ("document", "delete", "document:delete", "Delete documents"),
            ("document", "approve", "document:approve", "Approve and publish documents"),
            ("rag", "query", "rag:query", "Ask AI Copilot questions and search vector chunks"),
            ("rag", "manage", "rag:manage", "Manage RAG indices and vector settings"),
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
            ("department", "view", "department:view", "View department units"),
            ("department", "create", "department:create", "Create departments"),
            ("domain", "view", "domain:view", "View domain workspaces"),
            ("settings", "view", "settings:view", "View organization settings"),
            ("settings", "update", "settings:update", "Update organization settings"),
            ("audit", "view", "audit:view", "View tenant audit logs"),
        ]

        for res, act, key, desc in STANDARD_PERMISSIONS:
            p_exist = (await db.execute(select(Permission).where(Permission.permission_key == key))).scalars().first()
            if not p_exist:
                db.add(Permission(resource=res, action=act, permission_key=key, description=desc))
        await db.flush()

        all_perms_res = await db.execute(select(Permission))
        all_perms_map = {p.permission_key: p for p in all_perms_res.scalars().all()}

        # 10. Create 3 Roles for Globex:
        # a) hr_admin
        # b) hr_support
        # c) hr_emp
        roles_config = [
            {
                "slug": "hr_admin",
                "name": "HR Administrator",
                "description": "Full HR management, document upload control, employee onboarding, leave approval, and RAG configuration.",
                "perms": [
                    "dashboard:view",
                    "attendance:view", "attendance:mark", "attendance:update", "attendance:manage",
                    "leave:view", "leave:create", "leave:apply", "leave:approve", "leave:reject", "leave:manage",
                    "document:view", "document:read", "document:upload", "document:create", "document:update", "document:delete", "document:approve",
                    "rag:query", "rag:manage",
                    "user:view", "user:read", "user:create", "user:update", "user:delete",
                    "role:view", "role:read", "role:create", "role:update", "role:delete", "role:manage",
                    "department:view", "domain:view", "settings:view", "settings:update", "audit:view",
                ],
            },
            {
                "slug": "hr_support",
                "name": "HR Support",
                "description": "HR helpdesk, employee inquiries, handbook assistance, and ticket management.",
                "perms": [
                    "dashboard:view",
                    "attendance:view",
                    "leave:view",
                    "document:view", "document:read",
                    "rag:query",
                    "user:view", "user:read",
                    "department:view", "domain:view",
                ],
            },
            {
                "slug": "hr_emp",
                "name": "HR Employee",
                "description": "Employee self-service access to attendance marking, leave applications, and RAG HR chatbot queries.",
                "perms": [
                    "dashboard:view",
                    "attendance:view", "attendance:mark",
                    "leave:view", "leave:create", "leave:apply",
                    "document:view", "document:read",
                    "rag:query",
                ],
            },
        ]

        roles_map = {}
        for rc in roles_config:
            r_res = await db.execute(
                select(Role).where(
                    Role.organization_id == org.id,
                    Role.slug == rc["slug"],
                )
            )
            role_obj = r_res.scalars().first()
            if not role_obj:
                role_obj = Role(
                    organization_id=org.id,
                    domain_id=hr_domain.id,
                    name=rc["name"],
                    slug=rc["slug"],
                    description=rc["description"],
                    is_system=False,
                    is_active=True,
                )
                db.add(role_obj)
                await db.flush()
                print(f"Created Role: {role_obj.name} (slug: {role_obj.slug})")

            roles_map[rc["slug"]] = role_obj

            # Bind permissions
            for p_key in rc["perms"]:
                p_obj = all_perms_map.get(p_key)
                if p_obj:
                    rp_res = await db.execute(
                        select(RolePermission).where(
                            RolePermission.role_id == role_obj.id,
                            RolePermission.permission_id == p_obj.id,
                        )
                    )
                    if not rp_res.scalars().first():
                        db.add(RolePermission(role_id=role_obj.id, permission_id=p_obj.id))

        # 11. Create the 3 Globex Users:
        # 1. hrglobex@gmail.com (HR Admin)
        # 2. supportglobex@gmail.com (HR Support)
        # 3. empglobex@gmail.com (HR Employee)
        users_config = [
            {
                "email": "hrglobex@gmail.com",
                "name": "Globex HR Admin",
                "password": "Password123!",
                "is_admin": True,
                "role_slug": "hr_admin",
            },
            {
                "email": "priya@globex.com",
                "name": "Priya Sharma (HR Admin)",
                "password": "Password123!",
                "is_admin": True,
                "role_slug": "hr_admin",
            },
            {
                "email": "supportglobex@gmail.com",
                "name": "Globex HR Support Specialist",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_support",
            },
            {
                "email": "empglobex@gmail.com",
                "name": "Globex Employee (Jane Doe)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_emp",
            },
            {
                "email": "arun@globex.com",
                "name": "Arun Kumar (HR Employee)",
                "password": "Password123!",
                "is_admin": False,
                "role_slug": "hr_emp",
            },
        ]

        users_map = {}
        for uc in users_config:
            u_res = await db.execute(
                select(User).where(
                    User.organization_id == org.id,
                    User.email == uc["email"],
                )
            )
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
                print(f"Created User: {u_obj.email} ({u_obj.full_name})")
            else:
                u_obj.password_hash = hash_password(uc["password"])
                u_obj.is_active = True
                u_obj.is_org_admin = uc["is_admin"]
                await db.flush()
                print(f"Updated User: {u_obj.email} password to Password123!")

            users_map[uc["email"]] = u_obj

            # Bind User to Department
            ud_res = await db.execute(
                select(UserDepartment).where(
                    UserDepartment.user_id == u_obj.id,
                    UserDepartment.department_id == dept.id,
                )
            )
            if not ud_res.scalars().first():
                db.add(UserDepartment(user_id=u_obj.id, department_id=dept.id, is_primary=True))

            # Bind User to Role
            target_role = roles_map.get(uc["role_slug"])
            if target_role:
                ur_res = await db.execute(
                    select(UserRole).where(
                        UserRole.user_id == u_obj.id,
                        UserRole.role_id == target_role.id,
                    )
                )
                if not ur_res.scalars().first():
                    db.add(UserRole(user_id=u_obj.id, role_id=target_role.id))

        # 12. Seed Globex HR Policy Document and RAG Vector Embeddings
        hr_admin_user = users_map["hrglobex@gmail.com"]
        doc_filename = "globex_hr_employee_handbook_2026.txt"
        storage_key = f"organizations/{org.id}/domains/{hr_domain.id}/documents/{doc_filename}"

        doc_res = await db.execute(
            select(Document).where(
                Document.organization_id == org.id,
                Document.domain_id == hr_domain.id,
                Document.filename == doc_filename,
            )
        )
        doc = doc_res.scalars().first()

        doc_content = """# GLOBEX CORPORATION — OFFICIAL EMPLOYEE HANDBOOK & HR POLICY (2026)

## 1. Company Overview & Mission
Globex Corporation is a global technology and manufacturing enterprise. We provide high-performance solutions with excellence, integrity, and innovation.

## 2. Paid Time Off (PTO) & Leave Policy
- **Annual Vacation Days:** All full-time Globex employees receive 20 paid vacation days per calendar year.
- **Sick & Wellness Leave:** 10 paid sick days per year for illness, medical appointments, or family care.
- **Parental Leave:** 16 weeks of 100% paid parental leave for primary caregivers, 8 weeks for secondary caregivers.
- **Floating Holidays:** 3 floating holidays per year in addition to statutory national holidays.
- **Leave Approval:** Submit leave requests via the Globex Nexus HR portal at least 48 hours in advance for manager approval.

## 3. Remote Work & Flexibility
- **Hybrid Schedule:** Employees may work remotely on Mondays and Fridays. Tuesdays through Thursdays are in-office collaboration days.
- **Core Working Hours:** 10:00 AM to 4:00 PM local time. Flexible arrival between 8:00 AM and 10:00 AM.
- **Home Office Stipend:** A one-time $750 reimbursement is available for ergonomic workspace equipment.

## 4. Health, Wellness & Financial Benefits
- **Health & Dental Insurance:** 100% employer-sponsored health, vision, and dental coverage through BlueCross BlueShield.
- **401(k) Retirement Match:** Globex matches 100% of employee contributions up to 5% of annual base salary.
- **Wellness Allowance:** $100 per month for gym memberships, mental health apps, or fitness subscriptions.
- **Learning & Tuition Assistance:** Up to $3,000 annually for relevant certifications, conferences, and degree programs.

## 5. Annual Performance & Compensation Reviews
- Performance cycles occur annually every December with merit salary adjustments effective January 1st.
- Mid-year check-ins occur in June to track OKRs and professional growth goals.

## 6. HR Support & Inquiries
- For payroll, benefits, or general inquiries, contact HR Support at `supportglobex@gmail.com` or create a ticket in the Nexus Portal.
- Head of Human Resources: `hrglobex@gmail.com`.
"""

        if not doc:
            doc = Document(
                organization_id=org.id,
                domain_id=hr_domain.id,
                uploaded_by=hr_admin_user.id,
                filename=doc_filename,
                storage_key=storage_key,
                mime_type="text/plain",
                file_size=len(doc_content.encode("utf-8")),
                status="READY",
                page_count=2,
                chunk_count=6,
                metadata_json={"title": "Globex HR Employee Handbook 2026", "author": "HR Administration"},
            )
            db.add(doc)
            await db.flush()
            print(f"Created Document: {doc.filename} (id: {doc.id})")

            # Chunk document and generate vector embeddings
            sections = doc_content.split("\n\n## ")
            for idx, section in enumerate(sections):
                chunk_text = section if idx == 0 else f"## {section}"
                emb = await SecureRAGService.get_embedding(chunk_text)
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=idx,
                    content=chunk_text.strip(),
                    embedding=emb,
                    chunk_metadata={"section_index": idx, "filename": doc_filename},
                    page_number=(idx // 3) + 1,
                )
                db.add(chunk_obj)

            # Bind Document Access to Roles (hr_admin, hr_support, hr_emp)
            for role_slug, r_obj in roles_map.items():
                db.add(
                    DocumentRole(
                        document_id=doc.id,
                        role_id=r_obj.id,
                        access_level="ADMIN" if role_slug == "hr_admin" else "READ",
                    )
                )

            # Bind Document User Access to HR Admin
            db.add(
                DocumentUser(
                    document_id=doc.id,
                    user_id=hr_admin_user.id,
                    access_level="ADMIN",
                )
            )

        await db.commit()

        print("\n" + "=" * 70)
        print("  GLOBEX SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\nCredentials Seeded:")
        print("  1. HR Admin:      hrglobex@gmail.com       /  (Role: hr_admin)")
        print("  2. HR Support:    supportglobex@gmail.com  /    (Role: hr_support)")
        print("  3. HR Employee:   empglobex@gmail.com      / Password123! (Role: hr_emp)")
        print("\nTenant Subdomains / URLs:")
        print("  - http://hr.globex.localhost:3000")
        print("  - http://globex.localhost:3000")
        print("  - http://localhost:3000/globex/dashboard")
        print("=" * 70 + "\n")


if __name__ == "__main__":
    from seed_enterprise import seed_enterprise
    asyncio.run(seed_globex())
    asyncio.run(seed_enterprise())

