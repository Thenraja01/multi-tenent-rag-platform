import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User
from app.core.security import verify_password, hash_password

async def check_users():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        print(f"Total users in DB: {len(users)}")
        for u in users:
            print(f"User: {u.email} | Name: {u.full_name} | is_active: {u.is_active} | status: {u.status} | is_org_admin: {u.is_org_admin} | org_id: {u.organization_id}")
            # Reset password to Test@123
            u.password_hash = hash_password("Test@123")
            u.is_active = True
            u.status = "ACTIVE"
        await db.commit()
        print("Reset all users' password to Test@123.")

if __name__ == "__main__":
    asyncio.run(check_users())
