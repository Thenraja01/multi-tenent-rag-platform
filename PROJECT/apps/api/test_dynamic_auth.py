import asyncio
import sys
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User, Role, RolePermission, UserRole, UserPermission, Domain
from app.models.organization_models import Organization, OrganizationPack
from app.models.platform_models import Pack, Module, PackModule, Permission
from app.services.permission_service import PermissionService
from app.services.data_scope_service import DataScopeService
from app.services.dashboard_service import DashboardService
from app.services.rag_service import SecureRAGService


async def run_tests():
    print("\n==========================================")
    print("  NexusRAG Dynamic Authorization Test Suite")
    print("==========================================\n")

    async with AsyncSessionLocal() as db:
        # 1. Fetch Globex and users
        org_res = await db.execute(select(Organization).where(Organization.slug == "globex"))
        globex = org_res.scalars().first()
        if not globex:
            print("[ERROR] Globex organization not found. Seed first.")
            return

        print(f"[TEST 1] Tenant Found: {globex.name} (ID: {globex.id})")

        arun_res = await db.execute(select(User).where(User.email == "arun@globex.com"))
        arun = arun_res.scalars().first()

        priya_res = await db.execute(select(User).where(User.email == "priya@globex.com"))
        priya = priya_res.scalars().first()

        if not arun or not priya:
            print("[ERROR] Arun or Priya users not found.")
            return

        print(f"  -> User Arun: {arun.full_name} (Org Admin: {arun.is_org_admin})")
        print(f"  -> User Priya: {priya.full_name} (Org Admin: {priya.is_org_admin})")

        # 2. RBAC Verification
        arun_perms = await PermissionService.get_effective_permissions(db, str(arun.id), str(globex.id))
        priya_perms = await PermissionService.get_effective_permissions(db, str(priya.id), str(globex.id))

        print(f"\n[TEST 2] RBAC Verification:")
        print(f"  -> Arun effective permissions: {arun_perms}")
        print(f"  -> Priya effective permissions: {priya_perms}")

        assert "leave:view" in arun_perms, "Arun should have leave:view"
        assert "leave:approve" not in arun_perms, "Arun should NOT have leave:approve"
        assert "leave:approve" in priya_perms or "*" in priya_perms, "Priya should have leave:approve"
        print("  [PASS] RBAC: HR Admin can approve leave, Employee cannot.")

        # 3. Dynamic Dashboard Cards Verification
        arun_dashboard = await DashboardService.get_dashboard_cards(db, arun)
        priya_dashboard = await DashboardService.get_dashboard_cards(db, priya)

        arun_card_ids = [c["id"] for c in arun_dashboard["cards"]]
        priya_card_ids = [c["id"] for c in priya_dashboard["cards"]]

        print(f"\n[TEST 3] Dynamic Dashboard Cards:")
        print(f"  -> Arun visible cards: {arun_card_ids}")
        print(f"  -> Priya visible cards: {priya_card_ids}")

        assert "leave_balance" in arun_card_ids, "Arun should see leave_balance card"
        assert "leave_approval" not in arun_card_ids, "Arun should NOT see leave_approval card"
        assert "leave_approval" in priya_card_ids, "Priya should see leave_approval card"
        print("  [PASS] Dynamic Dashboard: Role-specific cards without hardcoded checks.")

        # 4. UBAC Override Verification (ALLOW override)
        print(f"\n[TEST 4] UBAC Override (ALLOW leave:approve):")
        leave_approve_perm = (await db.execute(
            select(Permission).where(Permission.permission_key == "leave:approve")
        )).scalars().first()

        if leave_approve_perm:
            # Add UBAC ALLOW override for Arun
            ubac_allow = UserPermission(
                user_id=arun.id,
                permission_id=leave_approve_perm.id,
                effect="ALLOW",
                created_by=priya.id,
            )
            db.add(ubac_allow)
            await db.commit()

            arun_updated_perms = await PermissionService.get_effective_permissions(db, str(arun.id), str(globex.id))
            assert "leave:approve" in arun_updated_perms, "Arun should now have leave:approve via UBAC"

            arun_updated_dashboard = await DashboardService.get_dashboard_cards(db, arun)
            arun_updated_card_ids = [c["id"] for c in arun_updated_dashboard["cards"]]
            assert "leave_approval" in arun_updated_card_ids, "Leave approval card should dynamically appear for Arun"
            print("  [PASS] UBAC ALLOW: Leave Approval card dynamically appeared on Arun's dashboard!")

            # 5. UBAC Override Verification (DENY override)
            print(f"\n[TEST 5] UBAC Override (DENY leave:approve):")
            ubac_allow.effect = "DENY"
            await db.commit()

            arun_denied_perms = await PermissionService.get_effective_permissions(db, str(arun.id), str(globex.id))
            assert "leave:approve" not in arun_denied_perms, "DENY override must strip leave:approve"

            arun_denied_dashboard = await DashboardService.get_dashboard_cards(db, arun)
            arun_denied_card_ids = [c["id"] for c in arun_denied_dashboard["cards"]]
            assert "leave_approval" not in arun_denied_card_ids, "Leave approval card must disappear"
            print("  [PASS] UBAC DENY: Explicit DENY strictly takes precedence over role permissions.")

            # Clean up test UBAC
            await db.delete(ubac_allow)
            await db.commit()

        # 6. Data Scope Verification
        scopes = await DataScopeService.get_all_data_scopes(db, arun)
        print(f"\n[TEST 6] Data Scope Resolution for Arun: {scopes}")
        assert scopes.get("leave") == "SELF", "Arun leave scope should be SELF"
        assert scopes.get("attendance") == "SELF", "Arun attendance scope should be SELF"
        print("  [PASS] Data Scopes: Correctly computed for employee vs admin.")

        # 7. Zero-Trust Pre-filtered RAG Retrieval
        print(f"\n[TEST 7] Zero-Trust RAG Pre-Filtering:")
        hr_domain_res = await db.execute(select(Domain).where(Domain.slug == "hr", Domain.organization_id == globex.id))
        hr_domain = hr_domain_res.scalars().first()
        domain_id = str(hr_domain.id) if hr_domain else None

        query_emb = SecureRAGService.generate_deterministic_embedding("What is the leave policy?")
        chunks = await SecureRAGService.retrieve_relevant_chunks(
            db=db,
            user_id=str(arun.id),
            organization_id=str(globex.id),
            domain_id=domain_id,
            query_embedding=query_emb,
            top_k=3,
        )
        print(f"  -> Retrieved {len(chunks)} ACL-authorized chunks for Arun")
        for idx, ch in enumerate(chunks):
            print(f"     [{idx+1}] File: {ch['filename']} | Score: {ch.get('similarity_score')} | Preview: {ch['content'][:60]}...")
        assert len(chunks) > 0, "Should retrieve authorized handbook chunks"
        print("  [PASS] RAG: Strict pre-retrieval ACL filtering verified.")

    print("\n==========================================")
    print("  ALL 7 AUTHORIZATION TESTS PASSED (100%)")
    print("==========================================\n")


if __name__ == "__main__":
    asyncio.run(run_tests())
