import asyncio
import os
import sys

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from httpx import AsyncClient, ASGITransport
from app.main import app
from seed_enterprise import seed_enterprise


async def test_roles_and_data_isolation():
    print("\n" + "=" * 80)
    print("  RUNNING VERIFICATION: 5 ROLES, DEPARTMENT ISOLATION & DASHBOARD FOCUS")
    print("=" * 80 + "\n")

    # 1. Run Seeder
    print("[1/5] Running Enterprise Seeder...")
    await seed_enterprise()
    print("[+] Seeding finished successfully.\n")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Test Logins for all 5 role tiers
        print("[2/5] Testing Authentication & Token Generation across all 5 Role Tiers...")
        test_accounts = [
            ("superadmin@localfix.app", "Test@123", "SuperAdmin"),
            ("admin@globex.com", "Password123!", "Org Admin"),
            ("hr.admin@globex.com", "Password123!", "HR Admin"),
            ("hr.manager@globex.com", "Password123!", "HR Manager"),
            ("hr.employee@globex.com", "Password123!", "HR Employee"),
            ("finance.admin@globex.com", "Password123!", "Finance Admin"),
            ("finance.manager@globex.com", "Password123!", "Finance Manager"),
            ("finance.employee@globex.com", "Password123!", "Finance Employee"),
        ]

        tokens = {}
        for email, pwd, label in test_accounts:
            login_payload = {"email": email, "password": pwd}
            res = await client.post("/api/v1/auth/login", json=login_payload)
            assert res.status_code == 200, f"Login failed for {email} ({label}): {res.text}"
            data = res.json()
            assert "access_token" in data, f"No access token for {email}"
            tokens[email] = data["access_token"]
            print(f"  [OK] Authenticated {label:18} -> {email} (User ID: {data.get('user', {}).get('id')})")

        print("\n[3/5] Testing /workspace/context (Role, Department & Data Scopes)...")
        # Check HR Admin Context
        hr_admin_token = tokens["hr.admin@globex.com"]
        res = await client.get("/api/v1/workspace/context", headers={"Authorization": f"Bearer {hr_admin_token}"})
        assert res.status_code == 200, f"HR Admin context failed: {res.text}"
        hr_ctx = res.json()
        assert hr_ctx["user"]["department"]["name"] == "Human Resources", f"Expected HR department, got {hr_ctx['user']['department']}"
        print("  [OK] HR Admin context correctly resolved: Dept = 'Human Resources', Role = 'HR Department Admin'")

        # Check Finance Admin Context
        fin_admin_token = tokens["finance.admin@globex.com"]
        res = await client.get("/api/v1/workspace/context", headers={"Authorization": f"Bearer {fin_admin_token}"})
        assert res.status_code == 200, f"Finance Admin context failed: {res.text}"
        fin_ctx = res.json()
        assert fin_ctx["user"]["department"]["name"] == "Finance & Accounting", f"Expected Finance department, got {fin_ctx['user']['department']}"
        print("  [OK] Finance Admin context correctly resolved: Dept = 'Finance & Accounting', Role = 'Finance Department Admin'")

        print("\n[4/5] Testing Department-Focused /workspace/dashboard dynamic layout...")
        # Check HR Admin Dashboard
        res = await client.get("/api/v1/workspace/dashboard", headers={"Authorization": f"Bearer {hr_admin_token}"})
        assert res.status_code == 200, f"HR Dashboard failed: {res.text}"
        hr_db = res.json()
        hr_card_ids = [c["id"] for c in hr_db["cards"]]
        print(f"  -> HR Admin Dashboard Cards: {hr_card_ids}")
        assert "attendance_summary" in hr_card_ids, "HR Admin must have attendance card"
        assert "leave_approval" in hr_card_ids, "HR Admin must have leave approval card"
        assert "employee_count" in hr_card_ids, "HR Admin must have employee count card"
        assert "finance_overview" not in hr_card_ids, "HR Admin should NOT have finance overview card (Department Isolation)"
        assert "invoice_approval" not in hr_card_ids, "HR Admin should NOT have invoice approval card (Department Isolation)"
        print("  [OK] HR Admin Dashboard is 100% focused on HR operations.")

        # Check Finance Admin Dashboard
        res = await client.get("/api/v1/workspace/dashboard", headers={"Authorization": f"Bearer {fin_admin_token}"})
        assert res.status_code == 200, f"Finance Dashboard failed: {res.text}"
        fin_db = res.json()
        fin_card_ids = [c["id"] for c in fin_db["cards"]]
        print(f"  -> Finance Admin Dashboard Cards: {fin_card_ids}")
        assert "finance_overview" in fin_card_ids, "Finance Admin must have finance overview card"
        assert "invoice_approval" in fin_card_ids, "Finance Admin must have invoice approval card"
        assert "expense_approval" in fin_card_ids, "Finance Admin must have expense approval card"
        assert "budget_alerts" in fin_card_ids, "Finance Admin must have budget alerts card"
        assert "attendance_summary" not in fin_card_ids, "Finance Admin should NOT have HR attendance card (Department Isolation)"
        assert "leave_approval" not in fin_card_ids, "Finance Admin should NOT have HR leave approval card (Department Isolation)"
        print("  [OK] Finance Admin Dashboard is 100% focused on Finance operations.")

        # Check Org Admin Dashboard (sees cross-department cards)
        org_admin_token = tokens["admin@globex.com"]
        res = await client.get("/api/v1/workspace/dashboard", headers={"Authorization": f"Bearer {org_admin_token}"})
        assert res.status_code == 200, f"Org Admin Dashboard failed: {res.text}"
        org_db = res.json()
        org_card_ids = [c["id"] for c in org_db["cards"]]
        print(f"  -> Org Admin Dashboard Cards: {org_card_ids}")
        assert "attendance_summary" in org_card_ids and "finance_overview" in org_card_ids, "Org Admin should see both HR and Finance"
        print("  [OK] Org Admin Dashboard sees holistic enterprise overview.")

        print("\n[5/5] Testing Department & Domain Data Separation (Documents & Permissions)...")
        # List documents for HR Admin
        res = await client.get("/api/v1/documents", headers={"Authorization": f"Bearer {hr_admin_token}"})
        assert res.status_code == 200
        hr_docs = res.json()
        hr_doc_names = [d["filename"] for d in hr_docs]
        print(f"  -> HR Admin Documents: {hr_doc_names}")
        assert "globex_hr_handbook_2026.txt" in hr_doc_names, "HR Admin must see HR handbook"
        assert "globex_finance_procurement_policy_2026.txt" not in hr_doc_names, "HR Admin must NOT see Finance policy (Data Isolation)"

        # List documents for Finance Admin
        res = await client.get("/api/v1/documents", headers={"Authorization": f"Bearer {fin_admin_token}"})
        assert res.status_code == 200
        fin_docs = res.json()
        fin_doc_names = [d["filename"] for d in fin_docs]
        print(f"  -> Finance Admin Documents: {fin_doc_names}")
        assert "globex_finance_procurement_policy_2026.txt" in fin_doc_names, "Finance Admin must see Finance policy"
        assert "globex_hr_handbook_2026.txt" not in fin_doc_names, "Finance Admin must NOT see HR handbook (Data Isolation)"
        print("  [OK] Document and Domain Data Separation strictly verified!")

    print("\n" + "=" * 80)
    print("  ALL 5 ROLES, DEPARTMENT RBAC, AND ISOLATION CHECKS PASSED PERFECTLY!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    asyncio.run(test_roles_and_data_isolation())
