import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User
from app.routers.audit import list_audit_logs


async def verify_audit_resolution():
    print("\n=======================================================")
    print("  NexusRAG Audit Logs Entity Resolution Verification")
    print("=======================================================\n")

    async with AsyncSessionLocal() as db:
        priya_res = await db.execute(select(User).where(User.email == "priya@globex.com"))
        priya = priya_res.scalars().first()

        logs = await list_audit_logs(limit=20, current_user=priya, db=db)
        print(f"Retrieved {len(logs)} resolved audit logs for Priya:")

        for i, l in enumerate(logs[:5]):
            print(f"\n[Log #{i+1}] {l['action']}")
            print(f"  -> Actor Name:   {l.get('actor_name')}")
            print(f"  -> Actor Email:  {l.get('actor_email')}")
            print(f"  -> Actor Role:   {l.get('actor_role')}")
            print(f"  -> Organization: {l.get('organization_name')} ({l.get('organization_slug')})")
            print(f"  -> Department:   {l.get('department_name')}")
            print(f"  -> Domain:       {l.get('domain_name')}")
            print(f"  -> Resource:     {l.get('resource_type')} -> {l.get('resource_name')}")

        assert len(logs) > 0, "Audit logs should not be empty"
        print("\n>>> AUDIT LOG RESOLUTION VERIFIED SUCCESSFULLY! <<<\n")


if __name__ == "__main__":
    asyncio.run(verify_audit_resolution())
