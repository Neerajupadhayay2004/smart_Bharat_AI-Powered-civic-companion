from typing import List, Dict, Any
import re
from app.core.logging import get_logger

logger = get_logger(__name__)


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    separator: str = "\n\n"
) -> List[Dict[str, Any]]:
    """
    Split text into chunks with optional overlap.
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum size of each chunk
        chunk_overlap: Overlap between chunks
        separator: Separator to use for splitting
        
    Returns:
        List of chunks with metadata
    """
    if not text:
        return []

    # First, split by separator
    initial_splits = text.split(separator)
    chunks = []
    current_chunk = []
    current_length = 0

    for split in initial_splits:
        split_length = len(split)
        
        # If adding this split would exceed chunk size, finalize current chunk
        if current_length + split_length > chunk_size and current_chunk:
            chunks.append(separator.join(current_chunk))
            # Add overlap
            if chunk_overlap > 0:
                overlap_text = separator.join(current_chunk[-2:]) if len(current_chunk) >= 2 else separator.join(current_chunk)
                current_chunk = [overlap_text, split]
                current_length = len(overlap_text) + split_length + len(separator)
            else:
                current_chunk = [split]
                current_length = split_length
        else:
            current_chunk.append(split)
            current_length += split_length + len(separator)

    # Add the last chunk
    if current_chunk:
        chunks.append(separator.join(current_chunk))

    # If chunks are still too big, split further
    final_chunks = []
    for chunk in chunks:
        if len(chunk) <= chunk_size:
            final_chunks.append(chunk)
        else:
            # Split by sentences or words
            sentences = re.split(r'(?<=[.!?])\s+', chunk)
            temp_chunk = []
            temp_length = 0
            for sentence in sentences:
                sent_len = len(sentence)
                if temp_length + sent_len > chunk_size and temp_chunk:
                    final_chunks.append(' '.join(temp_chunk))
                    temp_chunk = [sentence]
                    temp_length = sent_len
                else:
                    temp_chunk.append(sentence)
                    temp_length += sent_len + 1
            if temp_chunk:
                final_chunks.append(' '.join(temp_chunk))

    # Return with metadata
    return [
        {
            "text": chunk,
            "index": i,
            "length": len(chunk)
        }
        for i, chunk in enumerate(final_chunks)
    ]
