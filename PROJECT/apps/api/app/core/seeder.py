import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import hash_password
from app.models.platform_models import PlatformAdmin, Module, Pack, PackModule, Permission
from app.models.identity_models import Role
from app.models.organization_models import Organization

logger = logging.getLogger("nexusrag.seeder")

SEED_FILE_PATH = Path(__file__).parent / "seed.json"


def load_seed_data() -> Dict[str, Any]:
    """Load configuration seed data from JSON file."""
    if not SEED_FILE_PATH.exists():
        logger.warning(f"Seed file not found at {SEED_FILE_PATH}")
        return {}
    try:
        with open(SEED_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading seed.json: {e}")
        return {}


class SeederService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.seed_data = load_seed_data()

    async def seed_all(self):
        """Seed Platform SuperAdmin, platform catalog, permissions, and canonical system roles from seed.json."""
        logger.info("Starting NexusRAG Platform Seeder using seed.json...")
        await self.seed_platform_admin()
        await self.seed_modules()
        await self.seed_packs()
        await self.seed_permissions()
        await self.seed_canonical_roles()
        logger.info("All seed definitions synchronized successfully.")

    async def seed_platform_admin(self):
        admin_cfg = self.seed_data.get("superadmin", {})
        email = (settings.SUPERADMIN_EMAIL or admin_cfg.get("email", "superadmin@localfix.app")).strip().lower()
        full_name = settings.SUPERADMIN_NAME or admin_cfg.get("full_name", "Platform SuperAdmin")
        password = settings.SUPERADMIN_PASSWORD or admin_cfg.get("default_password", "Test@123")

        res = await self.db.execute(select(PlatformAdmin).where(PlatformAdmin.email == email))
        admin = res.scalar_one_or_none()
        if not admin:
            admin = PlatformAdmin(
                email=email,
                full_name=full_name,
                password_hash=hash_password(password),
                is_active=True,
            )
            self.db.add(admin)
            await self.db.commit()
            logger.info(f"Platform SuperAdmin ({email}) seeded from seed.json.")
        else:
            admin.full_name = full_name
            admin.password_hash = hash_password(password)
            admin.is_active = True
            await self.db.commit()

    async def seed_modules(self):
        modules = self.seed_data.get("modules", [])
        for mod_data in modules:
            slug = mod_data["slug"]
            res = await self.db.execute(select(Module).where(Module.slug == slug))
            existing = res.scalar_one_or_none()
            if not existing:
                mod = Module(
                    name=mod_data["name"],
                    slug=slug,
                    module_type=mod_data.get("module_type", "general"),
                    description=mod_data.get("description", ""),
                    is_active=True,
                )
                self.db.add(mod)
            else:
                existing.name = mod_data["name"]
                existing.description = mod_data.get("description", existing.description)
        await self.db.commit()
        logger.info(f"Loaded {len(modules)} Catalog Modules from seed.json.")

    async def seed_packs(self):
        packs = self.seed_data.get("packs", [])
        for pack_data in packs:
            slug = pack_data["slug"]
            res = await self.db.execute(select(Pack).where(Pack.slug == slug))
            pack = res.scalar_one_or_none()
            if not pack:
                pack = Pack(
                    name=pack_data["name"],
                    slug=slug,
                    description=pack_data.get("description", ""),
                    is_active=True,
                )
                self.db.add(pack)
                await self.db.flush()

                for mod_slug in pack_data.get("modules", []):
                    m_res = await self.db.execute(select(Module).where(Module.slug == mod_slug))
                    m = m_res.scalar_one_or_none()
                    if m:
                        self.db.add(PackModule(pack_id=pack.id, module_id=m.id))
        await self.db.commit()
        logger.info(f"Loaded {len(packs)} Platform Packs from seed.json.")

    async def seed_permissions(self):
        permissions = self.seed_data.get("permissions", [])
        for perm_data in permissions:
            p_key = perm_data["key"].lower()
            res = await self.db.execute(select(Permission).where(Permission.permission_key == p_key))
            if not res.scalar_one_or_none():
                perm = Permission(
                    resource=perm_data.get("resource", "system"),
                    action=perm_data.get("action", "manage"),
                    permission_key=p_key,
                    description=perm_data.get("description", ""),
                )
                self.db.add(perm)
        await self.db.commit()
        logger.info(f"Loaded {len(permissions)} System Permissions from seed.json.")

    async def seed_canonical_roles(self):
        from app.models.identity_models import RolePermission
        canonical_roles = self.seed_data.get("canonical_roles", [])
        
        # Seed Canonical Global System Roles (superadmin, tenant_admin, department_admin, manager, support, emp)
        for r_def in canonical_roles:
            r_slug = r_def["slug"]
            r_res = await self.db.execute(select(Role).where(Role.organization_id.is_(None), Role.slug == r_slug))
            role = r_res.scalar_one_or_none()
            r_name = r_def.get("name", r_slug)
            if not role:
                role = Role(
                    organization_id=None,
                    name=r_name,
                    slug=r_slug,
                    description=r_def.get("description", f"System {r_name} role"),
                    is_system=True,
                    is_active=True,
                )
                self.db.add(role)
                await self.db.flush()
            else:
                role.name = r_name
                role.slug = r_slug
                role.description = r_def.get("description", role.description)
                role.is_system = True
                role.is_active = True

            # Assign default permissions to the role
            default_perms = r_def.get("default_permissions", [])
            for p_key in default_perms:
                p_key_clean = p_key.lower().strip()
                p_stmt = select(Permission).where(Permission.permission_key == p_key_clean)
                perm = (await self.db.execute(p_stmt)).scalar_one_or_none()
                if perm:
                    rp_stmt = select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == perm.id,
                    )
                    existing_rp = (await self.db.execute(rp_stmt)).scalar_one_or_none()
                    if not existing_rp:
                        self.db.add(RolePermission(role_id=role.id, permission_id=perm.id))

        await self.db.commit()
        logger.info(f"Seeded {len(canonical_roles)} Canonical Global System Roles and permissions from seed.json.")

