import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.organization_models import Organization
from app.models.identity_models import Department, Domain, User

async def main():
    async with AsyncSessionLocal() as db:
        orgs = (await db.execute(select(Organization))).scalars().all()
        print("=== ORGANIZATIONS ===")
        for o in orgs:
            print(f"Org: {o.name} (id={o.id}, slug={o.slug}, status={o.status})")
            depts = (await db.execute(select(Department).where(Department.organization_id == o.id))).scalars().all()
            print("  Depts:", [(d.name, d.slug, getattr(d, 'status', None)) for d in depts])
            doms = (await db.execute(select(Domain).where(Domain.organization_id == o.id))).scalars().all()
            print("  Domains:", [(dm.name, dm.slug, getattr(dm, 'status', None)) for dm in doms])
            users = (await db.execute(select(User).where(User.organization_id == o.id))).scalars().all()
            print("  Users:", [u.email for u in users])

if __name__ == "__main__":
    asyncio.run(main())
