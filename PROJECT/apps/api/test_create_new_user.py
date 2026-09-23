import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def test_create_new_user():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Login with org_admin@gmail.com
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "org_admin@gmail.com", "password": "Test@123"},
        )
        print("Login status:", login_resp.status_code)
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Org & Depts
        roles = (await client.get("/api/v1/roles", headers=headers)).json()
        depts = (await client.get("/api/v1/departments", headers=headers)).json()
        org_admin_role = next(r for r in roles if r["slug"] == "org_admin")

        # 3. Create a unique user
        payload = {
            "name": "New Executive",
            "full_name": "New Executive",
            "email": "executive_new@globex.com",
            "password": "Password123!",
            "role_id": org_admin_role["id"],
            "role": "org_admin",
            "is_superadmin": False,
            "is_org_admin": True,
            "department_ids": [d["id"] for d in depts],
            "department_id": depts[0]["id"] if depts else None,
            "organization_id": depts[0]["organization_id"] if depts else None,
        }

        print("Submitting payload:", payload)
        resp = await client.post("/api/v1/users", headers=headers, json=payload)
        print("Create user status:", resp.status_code)
        print("Create user response:", resp.text)


if __name__ == "__main__":
    asyncio.run(test_create_new_user())
