import asyncio
import logging
from sqlalchemy import select, delete, update, or_
from app.database import AsyncSessionLocal
from app.models.identity_models import Role, UserRole, RolePermission, Department
from app.models.platform_models import Permission

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("role_cleanup")

# Standard canonical mapping for global roles
CANONICAL_GLOBAL_ROLES = {
    "superadmin": {
        "name": "Super Admin",
        "description": "Platform-wide system administrator with global authority.",
    },
    "org_admin": {
        "name": "Organization Administrator",
        "description": "Organization administrator with full tenant-wide management capabilities.",
    },
    "tenant_admin": {
        "name": "Organization Administrator",
        "alias_of": "org_admin",
    },
    "department_admin": {
        "name": "Department Administrator",
        "description": "Department administrator with management authority scoped to assigned department.",
    },
    "manager": {
        "name": "Manager",
        "description": "Business department manager with operational review and approval authority.",
    },
    "support": {
        "name": "Support Specialist",
        "description": "Operational support staff member handling tickets and customer inquiries.",
    },
    "emp": {
        "name": "Employee",
        "description": "Standard organization employee with basic department workspace capabilities.",
    },
}


async def cleanup_and_deduplicate_roles():
    logger.info("Starting RBAC Role Cleanup and Deduplication...")
    async with AsyncSessionLocal() as db:
        # 1. Fetch all roles
        res = await db.execute(select(Role))
        all_roles = res.scalars().all()
        logger.info(f"Found {len(all_roles)} total roles in database.")

        # Find org_admin and tenant_admin roles
        org_admin_roles = [r for r in all_roles if r.slug in ("org_admin", "tenant_admin")]
        primary_org_admin = next((r for r in org_admin_roles if r.slug == "org_admin"), None)
        legacy_tenant_admin = next((r for r in org_admin_roles if r.slug == "tenant_admin"), None)

        if primary_org_admin and legacy_tenant_admin and primary_org_admin.id != legacy_tenant_admin.id:
            logger.info(f"Merging legacy 'tenant_admin' ({legacy_tenant_admin.id}) into 'org_admin' ({primary_org_admin.id})...")
            
            # Reassign any user_roles pointing to legacy_tenant_admin -> primary_org_admin
            ur_res = await db.execute(select(UserRole).where(UserRole.role_id == legacy_tenant_admin.id))
            user_roles = ur_res.scalars().all()
            for ur in user_roles:
                # Check if user already has primary_org_admin
                existing_check = await db.execute(
                    select(UserRole).where(
                        UserRole.user_id == ur.user_id,
                        UserRole.role_id == primary_org_admin.id,
                    )
                )
                if not existing_check.scalar_one_or_none():
                    ur.role_id = primary_org_admin.id
                else:
                    await db.delete(ur)

            # Delete legacy role_permissions for legacy_tenant_admin
            await db.execute(delete(RolePermission).where(RolePermission.role_id == legacy_tenant_admin.id))
            # Delete legacy role
            await db.delete(legacy_tenant_admin)
            await db.commit()
            logger.info("Successfully merged legacy 'tenant_admin' into 'org_admin'.")

        # 2. Update role display names to clean human-readable titles
        res2 = await db.execute(select(Role))
        roles_to_clean = res2.scalars().all()

        for role in roles_to_clean:
            slug_key = role.slug.lower() if role.slug else ""
            if slug_key in CANONICAL_GLOBAL_ROLES and "alias_of" not in CANONICAL_GLOBAL_ROLES[slug_key]:
                meta = CANONICAL_GLOBAL_ROLES[slug_key]
                role.name = meta["name"]
                if "description" in meta and (not role.description or role.description.startswith("System ")):
                    role.description = meta["description"]
            elif role.name in ("emp", "support", "manager", "department_admin", "superadmin", "tenant_admin"):
                # Clean up legacy raw slug names
                role.name = role.name.replace("_", " ").title()

        await db.commit()
        logger.info("RBAC role names normalized successfully.")


if __name__ == "__main__":
    asyncio.run(cleanup_and_deduplicate_roles())
