import logging
from typing import List, Dict, Any

logger = logging.getLogger("nexusrag.pipelines.rag.synthesizer")


class RAGSynthesizer:
    """Assembles prompt context and interfaces with LLM gateways."""

    @staticmethod
    def build_context_prompt(query: str, sources: List[Dict[str, Any]]) -> str:
        context_parts = []
        for i, s in enumerate(sources, 1):
            context_parts.append(f"[{i}] {s.get('document_title', 'Document')}:\n{s.get('content', '')}")
        context_text = "\n\n".join(context_parts)
        
        prompt = (
            "You are a helpful and accurate enterprise AI assistant. Use the following verified organization documents "
            "to answer the question. If the documents do not contain the answer, state that clearly.\n\n"
            f"=== CONTEXT DOCUMENTS ===\n{context_text}\n\n"
            f"=== USER QUESTION ===\n{query}\n\n"
            "=== ANSWER ==="
        )
        return prompt
