import asyncio
import httpx
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User, Department, Role
from app.models.organization_models import Organization

BASE_URL = "http://127.0.0.1:8000"

async def test_form_submission():
    async with AsyncSessionLocal() as db:
        org = (await db.execute(select(Organization).where(Organization.slug == "globex"))).scalar_one_or_none()
        depts = (await db.execute(select(Department).where(Department.organization_id == org.id))).scalars().all()
        roles = (await db.execute(select(Role).where(Role.slug == "org_admin"))).scalars().all()
        admin_user = (await db.execute(select(User).where(User.email == "org_admin@gmail.com"))).scalar_one_or_none()

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "org_admin@gmail.com", "password": "Test@123"},
        )
        data = login_resp.json()
        token = data.get("access_token") or data.get("token") or (data.get("data", {}).get("access_token"))
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "full_name": "admin",
            "name": "admin",
            "email": "admin@globex.com",
            "role": "org_admin",
            "role_id": str(roles[0].id),
            "is_superadmin": False,
            "is_org_admin": True,
            "department_ids": [str(d.id) for d in depts],
            "department_id": str(depts[0].id) if depts else None,
            "organization_id": str(org.id),
            "password": "Password123!",
        }

        print("Testing POST /api/v1/users with payload:", payload)
        res = await client.post("/api/v1/users", headers=headers, json=payload)
        print("Response status:", res.status_code)
        print("Response body:", res.text)


if __name__ == "__main__":
    asyncio.run(test_form_submission())
