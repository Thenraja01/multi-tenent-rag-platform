import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def test_all_endpoints():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("==================================================")
        print("  TESTING ALL ENDPOINTS AS ORG ADMIN (org_admin@gmail.com)")
        print("==================================================")

        # 1. Login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "org_admin@gmail.com", "password": "Test@123"},
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        token = data.get("access_token") or data.get("token") or (data.get("data", {}).get("access_token"))
        headers = {"Authorization": f"Bearer {token}"}
        print("[OK] 1. Auth Login: OK (200)")

        # 2. Get Profile
        me_resp = await client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200, f"Auth me failed: {me_resp.text}"
        print(f"[OK] 2. Auth Profile: OK (200) -> {me_resp.json().get('email')} (is_org_admin: {me_resp.json().get('is_org_admin')})")

        # 3. List Roles
        roles_resp = await client.get("/api/v1/roles", headers=headers)
        assert roles_resp.status_code == 200, f"Get roles failed: {roles_resp.text}"
        roles = roles_resp.json()
        print(f"[OK] 3. Roles Endpoint: OK (200) -> Returned {len(roles)} roles")
        for r in roles:
            print(f"     - [{r.get('tier_label')}] (ID: {r.get('id')})")

        # 4. List Users
        users_resp = await client.get("/api/v1/users", headers=headers)
        assert users_resp.status_code == 200, f"Get users failed: {users_resp.text}"
        users_data = users_resp.json()
        items = users_data.get("items", users_data if isinstance(users_data, list) else [])
        print(f"[OK] 4. Users Endpoint (List): OK (200) -> Found {len(items)} users in tenant")

        # 5. List Departments
        depts_resp = await client.get("/api/v1/departments", headers=headers)
        assert depts_resp.status_code == 200, f"Get departments failed: {depts_resp.text}"
        depts = depts_resp.json()
        print(f"[OK] 5. Departments Endpoint: OK (200) -> Found {len(depts)} departments: {[d.get('name') for d in depts]}")

        # 6. List Modules
        modules_resp = await client.get("/api/v1/modules", headers=headers)
        assert modules_resp.status_code == 200, f"Get modules failed: {modules_resp.text}"
        print(f"[OK] 6. Modules Endpoint: OK (200) -> Found {len(modules_resp.json())} active modules")

        # 7. Navigation
        nav_resp = await client.get("/api/v1/navigation", headers=headers)
        assert nav_resp.status_code == 200, f"Get navigation failed: {nav_resp.text}"
        print(f"[OK] 7. Navigation Endpoint: OK (200)")

        # 8. Audit Logs
        audit_resp = await client.get("/api/v1/audit", headers=headers)
        assert audit_resp.status_code in (200, 204), f"Get audit failed: {audit_resp.text}"
        print(f"[OK] 8. Audit Logs Endpoint: OK ({audit_resp.status_code})")

        # 9. Documents
        doc_resp = await client.get("/api/v1/documents", headers=headers)
        assert doc_resp.status_code in (200, 204), f"Get documents failed: {doc_resp.text}"
        print(f"[OK] 9. Documents Endpoint: OK ({doc_resp.status_code})")

        # 10. Organization Settings
        settings_resp = await client.get("/api/v1/settings", headers=headers)
        assert settings_resp.status_code == 200, f"Get settings failed: {settings_resp.text}"
        print(f"[OK] 10. Settings Endpoint: OK (200)")

        print("==================================================")
        print("  ALL 10 ENDPOINTS PASSED CLEANLY FOR ORG ADMIN!  ")
        print("==================================================")


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
