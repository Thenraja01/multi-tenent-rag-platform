import asyncio
import logging
import app.models
from app.database import engine, init_db, AsyncSessionLocal
from app.models.base import Base
from app.core.seeder import SeederService
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reset_db")

async def main():
    print("1. Connecting to PostgreSQL and resetting schema...")
    async with engine.begin() as conn:
        if conn.dialect.name == "postgresql":
            await conn.execute(text("DROP SCHEMA public CASCADE"))
            await conn.execute(text("CREATE SCHEMA public"))
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        else:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    print("2. Reinitializing tables & PostgreSQL RLS policies...")
    await init_db()

    print("3. Seeding ONLY SuperAdmin and baseline system definitions...")
    async with AsyncSessionLocal() as session:
        seeder = SeederService(session)
        await seeder.seed_all()

    print("4. Verification & Statistics:")
    async with AsyncSessionLocal() as session:
        admin_res = await session.execute(text("SELECT email, full_name, is_active FROM platform_admins"))
        admins = admin_res.all()
        print(f"-> Platform SuperAdmin: {admins}")

        org_res = await session.execute(text("SELECT count(*) FROM organizations"))
        print(f"-> Organizations count: {org_res.scalar()} (should be 0)")

        user_res = await session.execute(text("SELECT count(*) FROM users"))
        print(f"-> Tenant Users count: {user_res.scalar()} (should be 0)")

        doc_res = await session.execute(text("SELECT count(*) FROM documents"))
        print(f"-> Documents count: {doc_res.scalar()} (should be 0)")

if __name__ == "__main__":
    asyncio.run(main())
