from typing import List, Dict, Any
from app.schemas.ai import CitationSource
from app.core.logging import get_logger

logger = get_logger(__name__)


def build_citations(retrieved_chunks: List[Dict[str, Any]]) -> List[CitationSource]:
    """
    Build citation sources from retrieved chunks.
    
    Args:
        retrieved_chunks: List of chunks from hybrid retriever
        
    Returns:
        List of formatted citation sources
    """
    citations = []
    seen_sources = set()

    for chunk in retrieved_chunks:
        source_url = chunk.get("source_url", "")
        if source_url and source_url not in seen_sources:
            # Take first 200 chars as evidence excerpt
            excerpt = chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
            
            citation = CitationSource(
                title=chunk.get("document_title", chunk.get("source_name", "Unknown")),
                url=source_url,
                department=chunk.get("department"),
                last_verified=chunk.get("last_verified"),
                reliability="official",
                evidence_excerpt=excerpt,
                relevance_score=chunk.get("relevance_score")
            )
            citations.append(citation)
            seen_sources.add(source_url)

    return citations


def validate_grounding(answer: str, citations: List[CitationSource]) -> Dict[str, Any]:
    """
    Validate that the answer is grounded in the retrieved citations.
    
    Args:
        answer: Generated answer
        citations: Retrieved citations
        
    Returns:
        Validation result with grounded and ungrounded claims
    """
    # Simple heuristic: check if answer contains info from citations
    grounded = False
    citation_texts = [cit.evidence_excerpt or "" for cit in citations] + \
                    [cit.title or "" for cit in citations]
    
    for cit_text in citation_texts:
        # Check if any key phrases overlap
        words = set(cit_text.lower().split())
        answer_words = set(answer.lower().split())
        overlap = words.intersection(answer_words)
        if len(overlap) > 3:
            grounded = True
            break

    return {
        "is_grounded": grounded,
        "grounding_confidence": 0.7 if grounded else 0.3,
        "note": "Grounding validated using heuristic overlap check"
    }
