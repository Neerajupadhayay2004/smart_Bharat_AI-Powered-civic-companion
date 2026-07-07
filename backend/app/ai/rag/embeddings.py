from typing import List
from app.ai.providers import get_llm_provider
from app.core.logging import get_logger

logger = get_logger(__name__)


async def get_embedding(text: str) -> List[float]:
    """Get embedding for a single text"""
    provider = get_llm_provider()
    return await provider.generate_embedding(text)


async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings for multiple texts"""
    provider = get_llm_provider()
    embeddings = []
    for text in texts:
        embedding = await provider.generate_embedding(text)
        embeddings.append(embedding)
    return embeddings
