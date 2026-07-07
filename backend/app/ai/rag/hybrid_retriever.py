from typing import List, Dict, Any, Optional
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import KnowledgeChunk, KnowledgeDocument, OfficialSource
from app.ai.rag.embeddings import get_embedding
from app.core.logging import get_logger

logger = get_logger(__name__)


class HybridRetriever:
    """Hybrid retriever combining vector search, text search, and metadata filtering"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        state: Optional[str] = None,
        department: Optional[str] = None,
        scheme: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant chunks using hybrid search.
        
        Args:
            query: User query
            top_k: Number of results to return
            state: Filter by state
            department: Filter by department
            scheme: Filter by scheme
            category: Filter by category
            
        Returns:
            List of relevant chunks with scores and metadata
        """
        # Get query embedding
        query_embedding = await get_embedding(query)

        # Build base query with vector search
        stmt = select(
            KnowledgeChunk,
            KnowledgeDocument,
            OfficialSource,
            # Calculate cosine similarity (pgvector)
            (1 - KnowledgeChunk.embedding.cosine_distance(query_embedding)).label('vector_score')
        ).select_from(KnowledgeChunk)\
            .join(KnowledgeDocument, KnowledgeChunk.document_id == KnowledgeDocument.id)\
            .join(OfficialSource, KnowledgeDocument.source_id == OfficialSource.id)\
            .where(KnowledgeChunk.embedding.isnot(None))

        # Apply metadata filters
        if state:
            stmt = stmt.where(OfficialSource.jurisdiction.ilike(f"%{state}%"))
        if department:
            stmt = stmt.where(OfficialSource.department.ilike(f"%{department}%"))

        # Execute vector search
        vector_results = []
        result = await self.db.execute(stmt.limit(top_k * 2))
        for chunk, doc, source, vector_score in result.all():
            vector_results.append({
                "chunk": chunk,
                "document": doc,
                "source": source,
                "vector_score": float(vector_score) if vector_score else 0.0,
                "text_score": 0.0,
                "combined_score": 0.0
            })

        # Calculate text search scores (simple keyword matching)
        query_keywords = query.lower().split()
        for result in vector_results:
            chunk_text = result["chunk"].chunk_text.lower()
            keyword_matches = sum(1 for keyword in query_keywords if keyword in chunk_text)
            result["text_score"] = keyword_matches / len(query_keywords) if query_keywords else 0.0

        # Combine scores (weighted average)
        for result in vector_results:
            result["combined_score"] = (
                0.7 * result["vector_score"] +
                0.3 * result["text_score"]
            )

        # Sort by combined score
        sorted_results = sorted(
            vector_results,
            key=lambda x: x["combined_score"],
            reverse=True
        )

        # Take top_k and format
        final_results = []
        for r in sorted_results[:top_k]:
            final_results.append({
                "id": str(r["chunk"].id),
                "text": r["chunk"].chunk_text,
                "section_title": r["chunk"].section_title,
                "document_title": r["document"].title,
                "source_name": r["source"].source_name,
                "source_url": r["source"].official_url,
                "department": r["source"].department,
                "last_verified": r["source"].last_verified_at.isoformat() if r["source"].last_verified_at else None,
                "vector_score": r["vector_score"],
                "text_score": r["text_score"],
                "relevance_score": r["combined_score"]
            })

        return final_results
