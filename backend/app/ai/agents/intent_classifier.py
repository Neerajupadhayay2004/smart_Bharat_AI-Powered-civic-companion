from typing import Optional
import re
from app.ai.providers import get_llm_provider
from app.ai.prompts.system_prompts import SYSTEM_PROMPT_INTENT_CLASSIFIER
from app.core.logging import get_logger

logger = get_logger(__name__)

# Keyword-based fallback for quick classification
KEYWORD_INTENTS = {
    "scheme_discovery": ["scheme", "yojana", "benefit", "apply", "scholarship", "pension", "loan"],
    "eligibility_check": ["eligible", "qualify", "can i apply", "am i eligible", "criteria"],
    "document_requirement": ["document", "certificate", "aadhaar", "pan", "needed", "required"],
    "document_analysis": ["analyze", "read", "understand", "document", "check", "verify"],
    "complaint_creation": ["complaint", "report", "issue", "problem", "grievance", "file"],
    "complaint_tracking": ["track", "status", "follow up", "check complaint"],
    "complaint_escalation": ["escalate", "higher authority", "not resolved"],
    "government_information": ["government", "policy", "rule", "law", "procedure", "process"],
    "simple_explanation": ["explain", "simple", "easy", "what is", "how to"],
    "translation": ["translate", "convert to", "in hindi", "in english"],
}


async def classify_intent(query: str, use_llm: bool = True) -> str:
    """
    Classify user query intent.
    
    Args:
        query: User query
        use_llm: Whether to use LLM for classification (fallback to keywords)
        
    Returns:
        Intent string
    """
    query_lower = query.lower()

    # First try keyword matching (fast)
    for intent, keywords in KEYWORD_INTENTS.items():
        for keyword in keywords:
            if keyword in query_lower:
                logger.debug(f"Keyword match: {intent} (keyword: {keyword})")
                return intent

    # If no keyword match and LLM is enabled, use LLM
    if use_llm:
        try:
            provider = get_llm_provider()
            intent = await provider.generate_text(
                prompt=query,
                system_prompt=SYSTEM_PROMPT_INTENT_CLASSIFIER,
                temperature=0.1,
                max_tokens=50
            )
            # Clean up and validate intent
            intent = intent.strip().lower().replace('"', '').replace("'", "")
            # Check if intent is valid
            valid_intents = list(KEYWORD_INTENTS.keys()) + ["general_civic_query", "unknown"]
            if intent in valid_intents:
                logger.debug(f"LLM classified intent: {intent}")
                return intent
        except Exception as e:
            logger.warning(f"LLM intent classification failed: {e}")

    # Default to general civic query
    logger.debug("Using fallback intent: general_civic_query")
    return "general_civic_query"
