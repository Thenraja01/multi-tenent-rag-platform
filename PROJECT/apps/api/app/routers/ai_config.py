import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.rag_models import AIConfiguration
from app.services.llm_gateway import llm_gateway, DOMAIN_PROMPTS
from app.services.audit_service import audit_service

router = APIRouter(prefix="/ai-config", tags=["AI Configuration & LLM Gateway"])


class AIConfigUpdatePayload(BaseModel):
    domain_id: Optional[str] = None
    provider: Optional[str] = Field("ollama", description="ollama, openai, gemini, anthropic, litellm")
    model: Optional[str] = Field("llama3.2")
    embedding_model: Optional[str] = Field("nomic-embed-text")
    fallback_provider: Optional[str] = Field("ollama")
    temperature: Optional[float] = Field(0.2, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(2048, ge=128, le=32768)
    system_prompt: Optional[str] = None
    rag_top_k: Optional[int] = Field(5, ge=1, le=20)
    min_relevance_score: Optional[float] = Field(0.50, ge=0.0, le=1.0)


@router.get("")
async def get_ai_configuration(
    domain_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    3.7 AI Configuration:
    Retrieve effective AI Configuration for current organization / domain.
    """
    cfg = await llm_gateway.get_effective_config(
        db=db,
        organization_id=str(current_user.organization_id) if current_user.organization_id else "",
        domain_id=domain_id,
    )
    return {
        "organization_id": str(current_user.organization_id) if current_user.organization_id else None,
        "domain_id": domain_id,
        "configuration": cfg,
        "available_providers": ["ollama", "openai", "gemini", "anthropic", "litellm"],
        "default_domain_prompts": DOMAIN_PROMPTS,
    }


@router.post("")
async def update_ai_configuration(
    payload: AIConfigUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    3.7 & 3.8: Update AI Configuration for organization or domain.
    """
    org_id = str(current_user.organization_id)
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant context required")

    stmt = select(AIConfiguration).where(
        AIConfiguration.organization_id == org_id,
        AIConfiguration.domain_id == payload.domain_id,
    )
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()

    if not cfg:
        cfg = AIConfiguration(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            domain_id=payload.domain_id,
            provider=payload.provider or "ollama",
            model=payload.model or "llama3.2",
            embedding_model=payload.embedding_model or "nomic-embed-text",
            fallback_provider=payload.fallback_provider or "ollama",
            temperature=payload.temperature if payload.temperature is not None else 0.2,
            max_tokens=payload.max_tokens or 2048,
            system_prompt=payload.system_prompt,
            rag_top_k=payload.rag_top_k or 5,
            min_relevance_score=payload.min_relevance_score if payload.min_relevance_score is not None else 0.50,
        )
        db.add(cfg)
    else:
        if payload.provider:
            cfg.provider = payload.provider
        if payload.model:
            cfg.model = payload.model
        if payload.embedding_model:
            cfg.embedding_model = payload.embedding_model
        if payload.fallback_provider:
            cfg.fallback_provider = payload.fallback_provider
        if payload.temperature is not None:
            cfg.temperature = payload.temperature
        if payload.max_tokens is not None:
            cfg.max_tokens = payload.max_tokens
        if payload.system_prompt is not None:
            cfg.system_prompt = payload.system_prompt
        if payload.rag_top_k is not None:
            cfg.rag_top_k = payload.rag_top_k
        if payload.min_relevance_score is not None:
            cfg.min_relevance_score = payload.min_relevance_score

    await db.commit()
    await db.refresh(cfg)

    await audit_service.log_event(
        db=db,
        action="AI_CONFIG_UPDATED",
        organization_id=org_id,
        actor_id=str(current_user.id),
        resource_type="ai_configuration",
        resource_id=str(cfg.id),
        metadata={"domain_id": payload.domain_id, "provider": cfg.provider, "model": cfg.model},
    )

    return {
        "message": "AI configuration updated successfully",
        "configuration": {
            "id": str(cfg.id),
            "organization_id": str(cfg.organization_id),
            "domain_id": str(cfg.domain_id) if cfg.domain_id else None,
            "provider": cfg.provider,
            "model": cfg.model,
            "embedding_model": cfg.embedding_model,
            "temperature": float(cfg.temperature),
            "max_tokens": cfg.max_tokens,
            "system_prompt": cfg.system_prompt,
            "rag_top_k": cfg.rag_top_k,
            "min_relevance_score": float(cfg.min_relevance_score),
        },
    }
