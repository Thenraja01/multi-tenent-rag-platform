"""
Nexus Multi-Tenant AI Chatbot CLI - Dynamic Interactive Selector
Allows you to:
1. Choose Persona: SuperAdmin OR Organization User
2. Dynamically lists all Organizations in PostgreSQL and lets you select one
3. Dynamically lists all Domains for that Organization and lets you select one
4. Starts the chat session with full pgvector context pre-filtered by tenant & domain
5. Allows typing '/switch' anytime inside chat to switch Org/Domain on the fly
"""
import sys
import argparse
import asyncio
from typing import Optional, List, Tuple
from sqlalchemy import select

from app.database import AsyncSessionLocal, init_db
from app.platform.models.organization import OrganizationModel
from app.platform.models.domain import DomainModel
from app.platform.models.user import UserModel
from app.modules.documents.models import DocumentModel
from app.core.context import TenantContext
from app.modules.documents.service.retrieval_service import DocumentRetrievalService
from app.modules.ai.service.rag_service import RAGService

# Force UTF-8 on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"


async def fetch_all_organizations(session) -> List[OrganizationModel]:
    """Fetches all unique organizations from database."""
    res = await session.execute(select(OrganizationModel).order_by(OrganizationModel.created_at.desc()))
    return res.scalars().all()


async def fetch_domains_for_org(session, org_id: str) -> List[DomainModel]:
    """Fetches all domains configured for the specified organization."""
    res = await session.execute(
        select(DomainModel)
        .where(DomainModel.organization_id == org_id)
        .order_by(DomainModel.created_at.asc())
    )
    return res.scalars().all()


async def prompt_user_selection(session) -> Tuple[TenantContext, Optional[OrganizationModel], Optional[DomainModel]]:
    """Interactive CLI menu to select SuperAdmin or Tenant User + Org + Domain."""
    print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
    print(f"{BOLD}{CYAN}            NEXUS MULTI-TENANT PLATFORM — PERSONA & DOMAIN SELECTOR     {RESET}")
    print(f"{BOLD}{CYAN}========================================================================{RESET}")
    
    print(f"{BOLD}Select your Access Level / Persona:{RESET}")
    print(f"  {BOLD}[1]{RESET} SuperAdmin (Full Platform Oversight)")
    print(f"  {BOLD}[2]{RESET} Organization Tenant User (Domain Isolated)")

    while True:
        choice = input(f"\n{BOLD}{CYAN}Enter Choice [1 or 2] (Default: 2):{RESET} ").strip() or "2"
        if choice in ("1", "2"):
            break
        print(f"{YELLOW}Invalid choice. Please enter 1 or 2.{RESET}")

    all_orgs = await fetch_all_organizations(session)
    if not all_orgs:
        # Fallback create default if database is empty
        org = OrganizationModel(name="Acme Technologies", slug="acme")
        session.add(org)
        await session.flush()
        all_orgs = [org]

    # --- SUPERADMIN FLOW ---
    if choice == "1":
        print(f"\n{BOLD}{GREEN}[SUPERADMIN MODE SELECTED]{RESET}")
        print(f"Available Organizations to inspect:")
        for idx, o in enumerate(all_orgs, 1):
            print(f"  {BOLD}[{idx}]{RESET} {o.name} (Slug: {o.slug}, ID: {o.id[:8]}...)")
        print(f"  {BOLD}[0]{RESET} Global Platform Context (All Organizations)")

        org_choice = input(f"\n{BOLD}{CYAN}Select Organization [0-{len(all_orgs)}] (Default: 0):{RESET} ").strip() or "0"
        
        target_org = None
        target_dom = None
        if org_choice.isdigit() and int(org_choice) > 0 and int(org_choice) <= len(all_orgs):
            target_org = all_orgs[int(org_choice) - 1]
            domains = await fetch_domains_for_org(session, target_org.id)
            if domains:
                print(f"\nAvailable Domains for {target_org.name}:")
                for didx, d in enumerate(domains, 1):
                    print(f"  {BOLD}[{didx}]{RESET} {d.name} ({d.subdomain})")
                print(f"  {BOLD}[0]{RESET} All Domains in {target_org.name}")
                dchoice = input(f"\n{BOLD}{CYAN}Select Domain [0-{len(domains)}] (Default: 0):{RESET} ").strip() or "0"
                if dchoice.isdigit() and int(dchoice) > 0 and int(dchoice) <= len(domains):
                    target_dom = domains[int(dchoice) - 1]

        context = TenantContext(
            user_id="superadmin-root",
            email="superadmin@nexus.platform",
            organization_id=target_org.id if target_org else None,
            organization_slug=target_org.slug if target_org else None,
            domain_id=target_dom.id if target_dom else None,
            domain_slug=target_dom.slug if target_dom else None,
            is_superadmin=True,
            roles=["superadmin"],
            permissions={"*"},
            enabled_modules={"*"},
        )
        return context, target_org, target_dom

    # --- TENANT USER FLOW ---
    print(f"\n{BOLD}Available Organizations ({len(all_orgs)} found):{RESET}")
    for idx, o in enumerate(all_orgs, 1):
        print(f"  {BOLD}[{idx}]{RESET} {GREEN}{o.name}{RESET} (Slug: {o.slug})")

    while True:
        sel = input(f"\n{BOLD}{CYAN}Select Organization [1-{len(all_orgs)}] (Default: 1):{RESET} ").strip() or "1"
        if sel.isdigit() and 1 <= int(sel) <= len(all_orgs):
            selected_org = all_orgs[int(sel) - 1]
            break
        print(f"{YELLOW}Invalid number. Choose between 1 and {len(all_orgs)}.{RESET}")

    domains = await fetch_domains_for_org(session, selected_org.id)
    if not domains:
        # Fallback default HR domain if none configured
        d = DomainModel(organization_id=selected_org.id, name="Human Resources", slug="hr", subdomain=f"hr.{selected_org.slug}.nexus")
        session.add(d)
        await session.flush()
        domains = [d]

    print(f"\n{BOLD}Available Domains for '{selected_org.name}':{RESET}")
    for didx, d in enumerate(domains, 1):
        print(f"  {BOLD}[{didx}]{RESET} {MAGENTA}{d.name}{RESET} ({d.subdomain}) [Slug: {d.slug}]")

    while True:
        dsel = input(f"\n{BOLD}{CYAN}Select Domain [1-{len(domains)}] (Default: 1):{RESET} ").strip() or "1"
        if dsel.isdigit() and 1 <= int(dsel) <= len(domains):
            selected_domain = domains[int(dsel) - 1]
            break
        print(f"{YELLOW}Invalid number. Choose between 1 and {len(domains)}.{RESET}")

    context = TenantContext(
        user_id=f"user-{selected_org.slug}-{selected_domain.slug}",
        email=f"employee@{selected_org.slug}.com",
        organization_id=selected_org.id,
        organization_slug=selected_org.slug,
        domain_id=selected_domain.id,
        domain_slug=selected_domain.slug,
        roles=[f"{selected_domain.slug}-employee"],
        permissions={"documents.view", "ai.chat"},
        enabled_modules={"documents", "ai", "leave", "attendance"},
    )
    return context, selected_org, selected_domain


async def run_chat_session():
    """Main interactive loop with dynamic context selection & live switching."""
    await init_db()

    async with AsyncSessionLocal() as session:
        retrieval_contract = DocumentRetrievalService(session)
        rag_service = RAGService(retrieval_contract)

        context, org, domain = await prompt_user_selection(session)

        while True:
            org_title = org.name if org else "All Organizations (SuperAdmin)"
            dom_title = domain.name if domain else "All Domains"
            role_title = "SuperAdmin" if context.is_superadmin else context.roles[0]

            print(f"\n{BOLD}{CYAN}========================================================================{RESET}")
            print(f"{BOLD}{CYAN}                     NEXUS AI CHATBOT — ACTIVE SESSION                  {RESET}")
            print(f"{BOLD}{CYAN}========================================================================{RESET}")
            print(f"Active Org    : {BOLD}{GREEN}{org_title}{RESET} ({context.organization_slug or 'GLOBAL'})")
            print(f"Active Domain : {BOLD}{MAGENTA}{dom_title}{RESET} ({context.domain_slug or 'ALL'})")
            print(f"User Persona  : {BOLD}{context.email}{RESET} [Role: {role_title}]")
            print(f"LLM Provider  : {BOLD}Docker Ollama (llama3.2){RESET} | Vector DB: {BOLD}PostgreSQL pgvector (5432){RESET}")
            print(f"\nCommands: Type {BOLD}'/switch'{RESET} to change Org/Domain, or {BOLD}'exit'{RESET} to quit.\n")

            while True:
                try:
                    prefix = f"[{context.organization_slug or 'admin'}:{context.domain_slug or 'all'}]"
                    user_input = input(f"{BOLD}{CYAN}{prefix} You:{RESET} ").strip()
                except (KeyboardInterrupt, EOFError):
                    print("\nGoodbye!")
                    return

                if not user_input:
                    continue
                if user_input.lower() in ("exit", "quit", "q"):
                    print("Exiting Nexus Chatbot. Have a great day!")
                    return
                if user_input.lower() in ("/switch", "/change", "switch"):
                    # Switch Organization/Domain dynamically
                    context, org, domain = await prompt_user_selection(session)
                    break

                print(f"\n{YELLOW}Querying pgvector for {org_title} ({dom_title}) with Docker Ollama...{RESET}")
                try:
                    response = await rag_service.generate_rag_response(
                        query=user_input,
                        context=context,
                        top_k=3,
                    )
                    print(f"\n{BOLD}{GREEN}[Nexus Bot]:{RESET}")
                    print(f"{response['answer']}\n")

                    citations = response.get("citations", [])
                    if citations:
                        print(f"{BOLD}{BLUE}[Citations - {len(citations)} source{'s' if len(citations) > 1 else ''}]:{RESET}")
                        for i, c in enumerate(citations, 1):
                            doc_name = c.get("document_name", "Document")
                            section = c.get("section", "General")
                            page = c.get("page_number", 1)
                            print(f"  [{i}] {BOLD}{doc_name}{RESET} (Page {page}) - Section: {section}")
                    else:
                        print(f"{YELLOW}(No authorized document citations matched for this context){RESET}")
                    print("\n" + "-" * 70 + "\n")
                except Exception as e:
                    print(f"\n{YELLOW}Error generating response: {e}{RESET}\n")


if __name__ == "__main__":
    asyncio.run(run_chat_session())
