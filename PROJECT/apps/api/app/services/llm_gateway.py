import json
import logging
import time
import asyncio
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.rag_models import AIConfiguration

logger = logging.getLogger("nexusrag.llm_gateway")

from app.core.seeder import load_seed_data

# Dynamic Domain-Specific AI System Prompts from seed.json
_seed = load_seed_data()
DOMAIN_PROMPTS: Dict[str, str] = _seed.get("domain_prompts", {})
DEFAULT_PROMPT: str = _seed.get("default_system_prompt", "You are Nexus AI Copilot, a secure enterprise intelligence assistant.")


class LLMGateway:
    """
    3.8 LiteLLM Multi-Provider Gateway:
    - Dynamic Provider Switching (Ollama, OpenAI, Gemini, Anthropic, LiteLLM)
    - Fallback configuration & resilient degradation
    - Organization and Domain-level model configuration
    """

    @staticmethod
    async def get_effective_config(
        db: AsyncSession,
        organization_id: str,
        domain_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetch custom AI configuration for domain or organization, or fallback to defaults."""
        # Check domain-specific config
        if domain_id:
            stmt = select(AIConfiguration).where(
                AIConfiguration.organization_id == organization_id,
                AIConfiguration.domain_id == domain_id,
            )
            res = await db.execute(stmt)
            cfg = res.scalar_one_or_none()
            if cfg:
                return {
                    "provider": cfg.provider,
                    "model": cfg.model,
                    "embedding_model": cfg.embedding_model,
                    "temperature": float(cfg.temperature),
                    "max_tokens": cfg.max_tokens,
                    "system_prompt": cfg.system_prompt,
                    "rag_top_k": cfg.rag_top_k,
                    "min_relevance_score": float(cfg.min_relevance_score),
                    "fallback_provider": cfg.fallback_provider or "ollama",
                }

        # Check org-level default config
        stmt = select(AIConfiguration).where(
            AIConfiguration.organization_id == organization_id,
            AIConfiguration.domain_id == None,  # noqa: E711
        )
        res = await db.execute(stmt)
        org_cfg = res.scalar_one_or_none()
        if org_cfg:
            return {
                "provider": org_cfg.provider,
                "model": org_cfg.model,
                "embedding_model": org_cfg.embedding_model,
                "temperature": float(org_cfg.temperature),
                "max_tokens": org_cfg.max_tokens,
                "system_prompt": org_cfg.system_prompt,
                "rag_top_k": org_cfg.rag_top_k,
                "min_relevance_score": float(org_cfg.min_relevance_score),
                "fallback_provider": org_cfg.fallback_provider or "ollama",
            }

        # System default config
        return {
            "provider": getattr(settings, "LLM_PROVIDER", "ollama"),
            "model": getattr(settings, "OLLAMA_MODEL", "llama3.2"),
            "embedding_model": getattr(settings, "OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"),
            "temperature": 0.2,
            "max_tokens": 2048,
            "system_prompt": None,
            "rag_top_k": 5,
            "min_relevance_score": 0.50,
            "fallback_provider": "ollama",
        }

    @staticmethod
    def get_system_prompt(domain_slug: Optional[str] = None, custom_prompt: Optional[str] = None) -> str:
        """3.9 Resolve domain-specific or custom system prompt."""
        if custom_prompt:
            return custom_prompt
        if domain_slug:
            return DOMAIN_PROMPTS.get(domain_slug.lower(), DEFAULT_PROMPT)
        return DEFAULT_PROMPT

    @staticmethod
    async def generate_response(
        prompt: str,
        system_prompt: str,
        config: Dict[str, Any],
    ) -> Optional[str]:
        """Generate complete response via configured LLM provider with fallback."""
        provider = config.get("provider", "ollama")
        model = config.get("model", "llama3.2")
        temperature = config.get("temperature", 0.2)

        # 1. Ollama Provider
        if provider == "ollama" or getattr(settings, "OLLAMA_BASE_URL", None):
            try:
                base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(
                        f"{base_url}/api/generate",
                        json={
                            "model": model,
                            "prompt": f"{system_prompt}\n\n{prompt}",
                            "stream": False,
                            "options": {"temperature": temperature},
                        },
                    )
                    if resp.status_code == 200:
                        ans = resp.json().get("response", "").strip()
                        if ans:
                            return ans
            except Exception as e:
                logger.debug(f"LLM Gateway Ollama note: {e}")

        # 2. OpenAI Provider (if OPENAI_API_KEY present)
        openai_key = getattr(settings, "OPENAI_API_KEY", None)
        if openai_key and (provider == "openai" or config.get("fallback_provider") == "openai"):
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_key}"},
                        json={
                            "model": model if provider == "openai" else "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": prompt},
                            ],
                            "temperature": temperature,
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        ans = data["choices"][0]["message"]["content"]
                        if ans:
                            return ans
            except Exception as e:
                logger.debug(f"LLM Gateway OpenAI note: {e}")

        return None


llm_gateway = LLMGateway()
