import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User
from app.core.security import hash_password, verify_password

async def test_user_password():
    async with AsyncSessionLocal() as db:
        user = (await db.execute(select(User).where(User.email == "org_admin@gmail.com"))).scalar_one_or_none()
        print("User:", user.email, "Hash:", user.password_hash[:25] if user else None)
        h = hash_password("Test@123")
        user.password_hash = h
        user.is_active = True
        user.status = "ACTIVE"
        await db.commit()
        print("Verification result:", verify_password("Test@123", h))

if __name__ == "__main__":
    asyncio.run(test_user_password())
