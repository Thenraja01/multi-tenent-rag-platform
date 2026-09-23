import asyncio
import logging
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.identity_models import User, Role, UserRole, RolePermission, UserDepartment
from app.models.platform_models import Permission

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cleanup_superadmin")

async def delete_superadmin_and_empower_org_admin():
    async with AsyncSessionLocal() as db:
        # 1. Delete SuperAdmin users
        sa_users_stmt = select(User).where(
            User.email.in_(["superadmin@gmail.com", "superadmin@localfix.app"])
        )
        sa_users = (await db.execute(sa_users_stmt)).scalars().all()
        for u in sa_users:
            logger.info(f"Deleting superadmin user: {u.email} ({u.id})")
            await db.delete(u)

        # 2. Delete SuperAdmin role
        sa_role_stmt = select(Role).where(Role.slug.in_(["superadmin", "super_admin"]))
        sa_roles = (await db.execute(sa_role_stmt)).scalars().all()
        for r in sa_roles:
            logger.info(f"Deleting superadmin role: {r.name} ({r.slug}) [{r.id}]")
            # Delete associated role permissions
            await db.execute(delete(RolePermission).where(RolePermission.role_id == r.id))
            # Delete associated user roles
            await db.execute(delete(UserRole).where(UserRole.role_id == r.id))
            await db.delete(r)

        # 3. Ensure Org Admin has wildcard '*' permission and all active rights
        wildcard_perm_stmt = select(Permission).where(Permission.permission_key == "*")
        wildcard_perm = (await db.execute(wildcard_perm_stmt)).scalar_one_or_none()
        if not wildcard_perm:
            wildcard_perm = Permission(
                resource="platform",
                action="manage",
                permission_key="*",
                description="Full wildcard management authority",
            )
            db.add(wildcard_perm)
            await db.flush()

        org_admin_roles_stmt = select(Role).where(Role.slug.in_(["org_admin", "tenant_admin"]))
        org_admin_roles = (await db.execute(org_admin_roles_stmt)).scalars().all()
        for oa_role in org_admin_roles:
            oa_role.name = "Organization Administrator"
            oa_role.is_system = True
            oa_role.is_active = True
            
            # Ensure wildcard permission linked
            rp_check = await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == oa_role.id,
                    RolePermission.permission_id == wildcard_perm.id,
                )
            )
            if not rp_check.scalar_one_or_none():
                db.add(RolePermission(role_id=oa_role.id, permission_id=wildcard_perm.id))

        # 4. Ensure org_admin@gmail.com is fully active with org_admin role
        oa_user_stmt = select(User).where(User.email == "org_admin@gmail.com")
        oa_user = (await db.execute(oa_user_stmt)).scalar_one_or_none()
        if oa_user:
            oa_user.is_org_admin = True
            oa_user.status = "ACTIVE"
            oa_user.is_active = True
            if org_admin_roles:
                primary_oa_role = org_admin_roles[0]
                ur_check = (await db.execute(select(UserRole).where(UserRole.user_id == oa_user.id))).scalars().first()
                if ur_check:
                    ur_check.role_id = primary_oa_role.id
                else:
                    db.add(UserRole(user_id=oa_user.id, role_id=primary_oa_role.id))

        await db.commit()
        logger.info("Successfully deleted superadmin and granted full root authority to Organization Administrator.")


if __name__ == "__main__":
    asyncio.run(delete_superadmin_and_empower_org_admin())
