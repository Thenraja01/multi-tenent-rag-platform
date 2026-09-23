from typing import Optional
from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.identity_models import User


def get_current_organization_id(current_user: User = Depends(get_current_user)) -> Optional[str]:
    """Retrieve and validate the authenticated user's organization scope."""
    return str(current_user.organization_id) if current_user.organization_id else None
