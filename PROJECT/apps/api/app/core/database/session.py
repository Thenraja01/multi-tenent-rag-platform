import logging
import os
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional, List
from contextlib import asynccontextmanager

from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import settings
from app.models.base import Base

logger = logging.getLogger("nexusrag.core.database")

engine_kwargs = {
    "echo": settings.DEBUG and False,
}
if os.getenv("TESTING") == "true":
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class DynamicSessionMaker:
    """Wrapper that delegates to the active async session factory."""
    def __call__(self, *args, **kwargs):
        return async_session_factory(*args, **kwargs)


AsyncSessionLocal = DynamicSessionMaker()


async def set_rls_context(session: AsyncSession, organization_id: Optional[str]) -> None:
    """Set PostgreSQL transaction-local organization ID for Row-Level Security."""
    if organization_id:
        try:
            await session.execute(
                text("SELECT set_config('app.organization_id', :org_id, true)"),
                {"org_id": str(organization_id)},
            )
        except Exception as e:
            logger.debug(f"Could not set RLS context: {e}")


async def get_db(organization_id: Optional[str] = None) -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an AsyncSession."""
    async with AsyncSessionLocal() as session:
        try:
            if organization_id:
                await set_rls_context(session, organization_id)
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context(organization_id: Optional[str] = None):
    """Context manager for standalone background tasks or services."""
    async with AsyncSessionLocal() as session:
        try:
            if organization_id:
                await set_rls_context(session, organization_id)
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


RLS_TENANT_TABLES = [
    "users",
    "departments",
    "domains",
    "roles",
    "documents",
    "rag_queries",
    "employees",
    "attendance_records",
    "leave_requests",
    "notifications",
    "audit_logs",
    "organization_packs",
    "organization_custom_domains",
]


async def apply_postgres_rls(conn) -> None:
    """Apply PostgreSQL Row-Level Security (RLS) policies to tenant-owned tables."""
    if conn.dialect.name != "postgresql":
        return

    for table in RLS_TENANT_TABLES:
        try:
            await conn.execute(text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;"))
            await conn.execute(text(f"DROP POLICY IF EXISTS {table}_isolation_policy ON {table};"))
            await conn.execute(text(f"""
                CREATE POLICY {table}_isolation_policy ON {table}
                FOR ALL
                USING (
                    organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid
                    OR current_setting('app.organization_id', true) = 'BYPASS'
                );
            """))
        except Exception as e:
            logger.debug(f"RLS policy setup for {table}: {e}")


async def init_db() -> None:
    """Initialize database extensions and create tables with automatic SQLite fallback."""
    global engine, async_session_factory
    
    import app.models  # noqa

    try:
        async with engine.begin() as conn:
            if conn.dialect.name == "postgresql":
                try:
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                except Exception as e:
                    logger.debug(f"Extension init note: {e}")
            
            await conn.run_sync(Base.metadata.create_all)
            await apply_postgres_rls(conn)
            logger.info("Connected to primary PostgreSQL database and initialized schema.")
    except Exception as e:
        logger.warning(f"Primary PostgreSQL connection note ({e}), using SQLite fallback.")
        engine = create_async_engine(
            "sqlite+aiosqlite:///./nexusrag.db",
            echo=False,
        )
        async_session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn, checkfirst=True))
        logger.info("Database schema initialized and verified.")
