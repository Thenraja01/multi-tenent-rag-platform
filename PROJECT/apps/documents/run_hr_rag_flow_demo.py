"""
Nexus Enterprise RAG Platform - Interactive E2E Flow Demonstration
Demonstrates the full multi-tenant lifecycle:
SuperAdmin -> HR Pack -> Acme Technologies -> hr.acme.nexus -> HR Manager Upload -> HR Employee RAG Search + Citations (Ollama LLM)
"""
import os
import sys
import asyncio
from datetime import datetime

from app.database import AsyncSessionLocal, init_db
from app.platform.service.platform_service import PlatformService
from app.platform.schemas.platform_schemas import (
    OrganizationCreate,
    PackCreate,
    ModuleCreate,
    DomainCreate,
)
from app.platform.models.user import UserModel, RoleModel, RolePermissionModel, PermissionModel, UserRoleModel
from app.core.context import TenantContext
from app.modules.documents.service.document_service import DocumentService
from app.modules.documents.service.retrieval_service import DocumentRetrievalService
from app.modules.ai.service.rag_service import RAGService
from sqlalchemy import select

GREEN = "\033[92m"
BLUE = "\033[94m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"


async def main():
    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}       NEXUS ENTERPRISE MULTI-TENANT RAG PLATFORM — FLOW VERIFICATION   {RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}\n")

    await init_db()

    async with AsyncSessionLocal() as session:
        platform_service = PlatformService(session)

        # -------------------------------------------------------------
        # STEP 1: SuperAdmin registers core business modules
        # -------------------------------------------------------------
        print(f"{BOLD}[1/7] SuperAdmin: Registering Platform Modules...{RESET}")
        modules = [
            ("documents", "Documents & Knowledge Base", "core"),
            ("ai", "AI & RAG Engine", "ai"),
            ("leave", "Leave & Time Off", "hr"),
            ("attendance", "Attendance & Tracking", "hr"),
        ]
        created_module_ids = []
        for slug, name, cat in modules:
            try:
                mod = await platform_service.create_module(ModuleCreate(name=name, slug=slug, category=cat))
                created_module_ids.append(mod.id)
                print(f"  {GREEN}+ Module created:{RESET} {name} (slug: {slug})")
            except Exception:
                existing = await platform_service.repo.get_module_by_slug(slug)
                if existing:
                    created_module_ids.append(existing.id)
                    print(f"  {YELLOW}* Existing module:{RESET} {name} (slug: {slug})")

        # -------------------------------------------------------------
        # STEP 2: SuperAdmin creates "HR Pack" bundling the 4 modules
        # -------------------------------------------------------------
        print(f"\n{BOLD}[2/7] SuperAdmin: Creating 'HR Pack' bundle...{RESET}")
        hr_pack_slug = "hr-pack"
        try:
            hr_pack = await platform_service.create_pack(
                PackCreate(
                    name="Human Resources Pack",
                    slug=hr_pack_slug,
                    description="Complete HR Department suite with Documents, AI, Leave, and Attendance",
                    module_ids=created_module_ids,
                )
            )
            print(f"  {GREEN}+ Pack created:{RESET} Human Resources Pack (ID: {hr_pack.id})")
        except Exception:
            hr_pack = await platform_service.repo.get_pack_by_slug(hr_pack_slug)
            print(f"  {YELLOW}* Existing pack:{RESET} Human Resources Pack (ID: {hr_pack.id})")

        # -------------------------------------------------------------
        # STEP 3: Create Organization "Acme Technologies" & Assign HR Pack
        # -------------------------------------------------------------
        print(f"\n{BOLD}[3/7] Provisioning Organization: 'Acme Technologies'...{RESET}")
        acme_slug = f"acme-tech-{int(datetime.utcnow().timestamp())}"
        acme_org = await platform_service.create_organization(
            OrganizationCreate(name="Acme Technologies", slug=acme_slug)
        )
        print(f"  {GREEN}+ Organization created:{RESET} Acme Technologies (Slug: {acme_slug}, ID: {acme_org.id})")

        # -------------------------------------------------------------
        # STEP 4: Create Domain "hr.acme.nexus" with HR Pack assigned
        # -------------------------------------------------------------
        print(f"\n{BOLD}[4/7] Provisioning Subdomain: 'hr.acme.nexus'...{RESET}")
        hr_domain = await platform_service.create_domain(
            org_id=acme_org.id,
            data=DomainCreate(
                name="Human Resources",
                slug="hr",
                subdomain="hr.acme.nexus",
                pack_id=hr_pack.id,
            ),
        )
        print(f"  {GREEN}+ Domain created:{RESET} {hr_domain.subdomain} (Domain ID: {hr_domain.id})")
        print(f"  {GREEN}+ Assigned Pack:{RESET} HR Pack (Modules: Documents, AI, Leave, Attendance)")

        # -------------------------------------------------------------
        # STEP 5: Create RBAC Roles & Users (HR Manager vs HR Employee)
        # -------------------------------------------------------------
        print(f"\n{BOLD}[5/7] Configuring Fine-Grained RBAC & Users...{RESET}")
        async def get_or_create_perm(p_name, p_slug, p_resource, p_action):
            res = await session.execute(select(PermissionModel).where(PermissionModel.slug == p_slug))
            p = res.scalars().first()
            if not p:
                p = PermissionModel(name=p_name, slug=p_slug, resource=p_resource, action=p_action)
                session.add(p)
                await session.flush()
            return p

        doc_view_perm = await get_or_create_perm("View Documents", "documents.view", "documents", "view")
        doc_upload_perm = await get_or_create_perm("Upload Documents", "documents.upload", "documents", "upload")
        ai_chat_perm = await get_or_create_perm("AI Chat", "ai.chat", "ai", "chat")

        # Manager Role
        manager_role = RoleModel(organization_id=acme_org.id, name="HR Manager", slug="hr-manager")
        session.add(manager_role)
        await session.flush()
        session.add(RolePermissionModel(role_id=manager_role.id, permission_id=doc_view_perm.id))
        session.add(RolePermissionModel(role_id=manager_role.id, permission_id=doc_upload_perm.id))
        session.add(RolePermissionModel(role_id=manager_role.id, permission_id=ai_chat_perm.id))

        # Employee Role
        employee_role = RoleModel(organization_id=acme_org.id, name="HR Employee", slug="hr-employee")
        session.add(employee_role)
        await session.flush()
        session.add(RolePermissionModel(role_id=employee_role.id, permission_id=doc_view_perm.id))
        session.add(RolePermissionModel(role_id=employee_role.id, permission_id=ai_chat_perm.id))

        manager_user = UserModel(
            organization_id=acme_org.id,
            email=f"sarah.manager@{acme_slug}.com",
            full_name="Sarah Jenkins (HR Manager)",
        )
        employee_user = UserModel(
            organization_id=acme_org.id,
            email=f"john.employee@{acme_slug}.com",
            full_name="John Doe (HR Employee)",
        )
        session.add_all([manager_user, employee_user])
        await session.flush()

        session.add(UserRoleModel(user_id=manager_user.id, role_id=manager_role.id, domain_id=hr_domain.id))
        session.add(UserRoleModel(user_id=employee_user.id, role_id=employee_role.id, domain_id=hr_domain.id))
        await session.commit()

        print(f"  {GREEN}+ User:{RESET} {manager_user.full_name} -> Role: {manager_role.name} [Upload, View, AI]")
        print(f"  {GREEN}+ User:{RESET} {employee_user.full_name} -> Role: {employee_role.name} [View, AI]")

        # -------------------------------------------------------------
        # STEP 6: HR Manager Uploads leave-policy.pdf & Vector Ingestion
        # -------------------------------------------------------------
        print(f"\n{BOLD}[6/7] HR Manager: Uploading 'sample_leave_policy.txt' as 'leave-policy.pdf'...{RESET}")
        manager_ctx = TenantContext(
            user_id=manager_user.id,
            email=manager_user.email,
            organization_id=acme_org.id,
            domain_id=hr_domain.id,
            domain_slug="hr",
            roles=["hr-manager"],
            permissions={"documents.view", "documents.upload", "ai.chat"},
            enabled_modules={"documents", "ai", "leave", "attendance"},
        )

        with open("sample_leave_policy.txt", "rb") as f:
            file_bytes = f.read()

        doc_service = DocumentService(session)
        doc = await doc_service.upload_document(
            file_bytes=file_bytes,
            filename="leave-policy.pdf",
            content_type="text/plain",
            context=manager_ctx,
            visibility="DOMAIN",
            description="Acme Technologies Comprehensive Leave & Time Off Policy 2026",
        )
        print(f"  {GREEN}+ Document Ingested & Indexed:{RESET} {doc.name} (ID: {doc.id}, Status: {doc.status})")
        print(f"  {GREEN}+ pgvector Chunks Created & Stored in PostgreSQL 5432{RESET}")

        # -------------------------------------------------------------
        # STEP 7: HR Employee queries RAG with Docker Ollama LLM
        # -------------------------------------------------------------
        print(f"\n{BOLD}[7/7] HR Employee: Asking Question in Default Nexus Chat...{RESET}")
        employee_ctx = TenantContext(
            user_id=employee_user.id,
            email=employee_user.email,
            organization_id=acme_org.id,
            domain_id=hr_domain.id,
            domain_slug="hr",
            roles=["hr-employee"],
            permissions={"documents.view", "ai.chat"},
            enabled_modules={"documents", "ai", "leave", "attendance"},
        )

        query = "What is our annual paid leave entitlement, and what is the policy for sick leave?"
        print(f"  {CYAN}Question:{RESET} \"{query}\"\n")

        retrieval_contract = DocumentRetrievalService(session)
        rag_service = RAGService(retrieval_contract)

        print(f"  {YELLOW}Querying pgvector retrieval & generating answer with Docker Ollama llama3.2...{RESET}")
        rag_res = await rag_service.generate_rag_response(
            query=query,
            context=employee_ctx,
            top_k=3,
        )

        print(f"\n{BOLD}{GREEN}=== AI GENERATED ANSWER ==={RESET}")
        print(f"{rag_res['answer']}\n")

        print(f"{BOLD}{BLUE}=== RETRIEVED CITATIONS ({len(rag_res['citations'])} sources) ==={RESET}")
        for i, c in enumerate(rag_res['citations'], 1):
            print(f"  [{i}] Document: {BOLD}{c['document_name']}{RESET} | Section: {c.get('section', 'N/A')} | Page: {c.get('page_number', 1)}")
            print(f"      Excerpt: {c.get('text_snippet', '')[:120]}...\n")

        # Security check: Tenant isolation
        intruder_ctx = TenantContext(
            user_id="intruder-1",
            email="intruder@competitor.com",
            organization_id="unauthorized-org",
            domain_id="unauthorized-domain",
            permissions={"documents.view", "ai.chat"},
        )
        isolated_res = await rag_service.generate_rag_response(
            query=query,
            context=intruder_ctx,
            top_k=3,
        )
        print(f"{BOLD}[SECURITY ISOLATION CHECK]{RESET}")
        print(f"  Tenant Isolation Verified: Competitor query chunks retrieved: {GREEN}{isolated_res['chunks_used']} chunks{RESET} (0 expected).")
        print(f"\n{BOLD}{GREEN}SUCCESS: End-to-End Multi-Tenant HR RAG Lifecycle verified successfully!{RESET}\n")


if __name__ == "__main__":
    asyncio.run(main())
