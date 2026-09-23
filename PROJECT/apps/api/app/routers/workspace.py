from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.routers.navigation import get_workspace_context, get_workspace_dashboard

router = APIRouter(prefix="/workspace", tags=["Workspace"])


@router.get("/context")
async def get_context(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full workspace context for frontend initialization."""
    return await get_workspace_context(current_user=current_user, db=db)


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve dynamic dashboard card layout and real-time metrics."""
    return await get_workspace_dashboard(current_user=current_user, db=db)
