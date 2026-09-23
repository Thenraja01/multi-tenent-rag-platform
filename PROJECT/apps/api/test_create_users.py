import asyncio
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.identity_models import User, Department, Role, UserRole, UserDepartment
from app.models.organization_models import Organization
from app.core.security import hash_password

USERS_TO_CREATE = [
    {
        "email": "org_admin@gmail.com",
        "full_name": "Globex Org Administrator",
        "role_slug": "org_admin",
        "dept_slug": "hr",
    },
    {
        "email": "dept_admin@gmail.com",
        "full_name": "Globex Department Admin",
        "role_slug": "department_admin",
        "dept_slug": "finance",
    },
    {
        "email": "manager@gmail.com",
        "full_name": "Globex Manager",
        "role_slug": "manager",
        "dept_slug": "hr",
    },
    {
        "email": "emp@gmail.com",
        "full_name": "Globex Employee",
        "role_slug": "emp",
        "dept_slug": "it",
    },
]


async def test_and_seed_globex_users():
    async with AsyncSessionLocal() as db:
        # 1. Get or create Globex organization
        org_res = await db.execute(select(Organization).where(Organization.slug == "globex"))
        org = org_res.scalar_one_or_none()
        if not org:
            org_res = await db.execute(select(Organization).limit(1))
            org = org_res.scalar_one_or_none()

        if not org:
            print("Creating default Globex organization...")
            org = Organization(
                name="Globex Corporation",
                slug="globex",
                status="ACTIVE",
                tier="ENTERPRISE",
            )
            db.add(org)
            await db.commit()
            await db.refresh(org)

        print(f"Target Organization: {org.name} ({org.slug}) [ID: {org.id}]")

        # 2. Fetch departments
        depts_res = await db.execute(select(Department).where(Department.organization_id == org.id))
        depts = depts_res.scalars().all()
        dept_map = {d.slug.lower(): d for d in depts}
        print(f"Found {len(depts)} departments: {list(dept_map.keys())}")

        # 3. Fetch roles
        roles_res = await db.execute(select(Role))
        roles = roles_res.scalars().all()
        role_map = {r.slug.lower(): r for r in roles}
        print(f"Found {len(roles)} roles: {list(role_map.keys())}")

        # 4. Create/update users
        created_users = []
        for u_def in USERS_TO_CREATE:
            email = u_def["email"].lower().strip()
            user_res = await db.execute(
                select(User).where(User.organization_id == org.id, User.email == email)
            )
            existing_user = user_res.scalar_one_or_none()

            role_obj = role_map.get(u_def["role_slug"].lower())
            if not role_obj:
                # Fallback to org_admin / emp
                role_obj = role_map.get("org_admin") or role_map.get("emp") or roles[0]

            dept_obj = dept_map.get(u_def["dept_slug"].lower())
            if not dept_obj and depts:
                dept_obj = depts[0]

            if not existing_user:
                print(f"Creating user {email} ({u_def['full_name']}) with role '{role_obj.name}'...")
                new_user = User(
                    organization_id=org.id,
                    email=email,
                    full_name=u_def["full_name"],
                    password_hash=hash_password("Test@123"),
                    status="ACTIVE",
                    is_active=True,
                    is_org_admin=(u_def["role_slug"] in ("org_admin", "superadmin")),
                    email_verified=True,
                )
                db.add(new_user)
                await db.flush()

                # Link Role
                db.add(UserRole(user_id=new_user.id, role_id=role_obj.id))

                # Link Department
                if dept_obj:
                    db.add(UserDepartment(user_id=new_user.id, department_id=dept_obj.id, is_primary=True))

                created_users.append(new_user)
            else:
                print(f"User {email} already exists, updating password and role...")
                existing_user.password_hash = hash_password("Test@123")
                existing_user.status = "ACTIVE"
                existing_user.is_active = True
                existing_user.is_org_admin = (u_def["role_slug"] in ("org_admin", "superadmin"))

                # Re-link role
                await db.execute(
                    select(UserRole).where(UserRole.user_id == existing_user.id)
                )
                existing_ur = (await db.execute(select(UserRole).where(UserRole.user_id == existing_user.id))).scalar_one_or_none()
                if existing_ur:
                    existing_ur.role_id = role_obj.id
                else:
                    db.add(UserRole(user_id=existing_user.id, role_id=role_obj.id))

                created_users.append(existing_user)

        await db.commit()
        print("\nAll Globex users created/updated successfully with password 'Test@123':")
        for u in USERS_TO_CREATE:
            print(f" - Email: {u['email']} | Full Name: {u['full_name']} | Role: {u['role_slug']} | Dept: {u['dept_slug']} | Password: Test@123")


if __name__ == "__main__":
    asyncio.run(test_and_seed_globex_users())
