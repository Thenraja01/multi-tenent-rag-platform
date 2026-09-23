import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User
from app.core.security import hash_password

async def undelete_and_activate_all():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        for u in users:
            u.deleted_at = None
            u.is_active = True
            u.status = "ACTIVE"
            u.password_hash = hash_password("Test@123")
        await db.commit()
        print(f"Undeleted and activated {len(users)} users with password 'Test@123'.")

if __name__ == "__main__":
    asyncio.run(undelete_and_activate_all())
