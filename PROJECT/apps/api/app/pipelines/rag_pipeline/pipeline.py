from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.pipelines.rag_pipeline.retriever import MultiDomainRetriever
from app.pipelines.rag_pipeline.synthesizer import RAGSynthesizer
from app.services.llm_gateway import LLMGateway


class RAGPipeline:
    """Pure Vector & Hybrid Multi-Domain RAG Pipeline."""

    @staticmethod
    async def execute(
        session: AsyncSession,
        query: str,
        organization_id: str,
        domain_id: Optional[str] = None,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        # 1. Retrieve isolated chunks
        sources = await MultiDomainRetriever.retrieve(
            session=session,
            query_text=query,
            organization_id=organization_id,
            domain_id=domain_id,
            top_k=top_k,
        )

        # 2. Build prompt context
        prompt = RAGSynthesizer.build_context_prompt(query, sources)

        # 3. Call LLM Gateway
        gateway = LLMGateway()
        answer = await gateway.generate(prompt)

        return {
            "query": query,
            "answer": answer,
            "sources": sources,
            "domain_id": domain_id,
        }
