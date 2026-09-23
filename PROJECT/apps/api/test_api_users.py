import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def test_api_create_user():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Login as SuperAdmin or OrgAdmin to get token
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "superadmin@gmail.com", "password": "Test@123"},
        )
        if login_resp.status_code != 200:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "org_admin@gmail.com", "password": "Test@123"},
            )

        print(f"Login Response: {login_resp.status_code}")
        data = login_resp.json()
        token = data.get("access_token") or data.get("token") or (data.get("data", {}).get("access_token"))
        if not token:
            print("Could not retrieve login token:", data)
            return

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Roles
        roles_resp = await client.get("/api/v1/roles", headers=headers)
        print(f"GET /roles Response: {roles_resp.status_code}")
        roles = roles_resp.json()
        print(f"Fetched {len(roles)} roles from backend.")
        for r in roles[:5]:
            print(f"  • {r.get('tier_label') or r.get('name')} (ID: {r.get('id')})")

        # 3. Create a new test user via POST /users
        test_email = "testuser_api@gmail.com"
        create_resp = await client.post(
            "/api/v1/users",
            headers=headers,
            json={
                "email": test_email,
                "name": "API Test User",
                "password": "Test@123",
                "role_id": roles[0]["id"],
                "status": "ACTIVE",
            },
        )
        print(f"POST /users Response: {create_resp.status_code}")
        print("Created User payload:", create_resp.json())


if __name__ == "__main__":
    asyncio.run(test_api_create_user())
