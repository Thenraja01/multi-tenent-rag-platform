import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User

async def check_duplicate_emails():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User).where(User.email == "org_admin@gmail.com"))).scalars().all()
        print(f"Found {len(users)} users with email org_admin@gmail.com:")
        for u in users:
            print(f" - ID: {u.id}, Org: {u.organization_id}, Deleted: {u.deleted_at}")
        if len(users) > 1:
            print("Removing duplicate user records...")
            for u in users[1:]:
                await db.delete(u)
            await db.commit()
            print("Cleaned up duplicate users.")

if __name__ == "__main__":
    asyncio.run(check_duplicate_emails())
