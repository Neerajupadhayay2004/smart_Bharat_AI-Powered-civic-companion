from typing import Dict, Any, Optional
import re
from app.ai.providers import get_llm_provider
from app.ai.prompts.system_prompts import SYSTEM_PROMPT_ENTITY_EXTRACTOR
from app.core.logging import get_logger

logger = get_logger(__name__)

# List of Indian states for matching
INDIAN_STATES = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand",
    "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
    "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
    "uttar pradesh", "uttarakhand", "west bengal",
    "andaman and nicobar", "chandigarh", "dadra and nagar haveli",
    "daman and diu", "delhi", "jammu and kashmir", "ladakh", "lakshadweep",
    "puducherry", "up", "mp", "ap", "tn", "ka", "mh", "guj", "rj", "hr", "pb"
]


async def extract_entities(query: str, use_llm: bool = True) -> Dict[str, Any]:
    """
    Extract entities from user query.
    
    Args:
        query: User query
        use_llm: Whether to use LLM for extraction
        
    Returns:
        Dictionary of extracted entities
    """
    entities: Dict[str, Any] = {}
    query_lower = query.lower()

    # Extract age using regex
    age_match = re.search(r'(\d{1,2})\s*(?:year|yr|years|yrs)\s*old', query_lower) or \
                re.search(r'age\s*(?:is|of|:)?\s*(\d{1,2})', query_lower)
    if age_match:
        entities["age"] = int(age_match.group(1))

    # Extract income
    income_match = re.search(r'(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lac|crore|thousand|k)?', query_lower) or \
                  re.search(r'([\d,]+(?:\.\d+)?)\s*(?:lakh|lac|crore|thousand|k)\s*(?:per year|annual|pa)?', query_lower)
    if income_match:
        amount_str = income_match.group(1).replace(',', '')
        try:
            amount = float(amount_str)
            # Check for units
            if re.search(r'lakh|lac', query_lower[income_match.end():income_match.end()+10]):
                amount *= 100000
            elif re.search(r'crore', query_lower[income_match.end():income_match.end()+10]):
                amount *= 10000000
            elif re.search(r'thousand|k', query_lower[income_match.end():income_match.end()+10]):
                amount *= 1000
            entities["income"] = amount
        except ValueError:
            pass

    # Extract state
    for state in INDIAN_STATES:
        if state in query_lower:
            entities["state"] = state.title()
            break

    # Extract occupation keywords
    occupation_keywords = ["student", "teacher", "engineer", "doctor", "farmer", "worker", "employee", "businessman", "unemployed"]
    for occ in occupation_keywords:
        if occ in query_lower:
            entities["occupation"] = occ
            if occ == "student":
                entities["is_student"] = True
            if occ == "farmer":
                entities["is_farmer"] = True
            break

    # Extract gender
    if re.search(r'\b(woman|women|female|girl)\b', query_lower):
        entities["gender"] = "female"
    elif re.search(r'\b(man|men|male|boy)\b', query_lower):
        entities["gender"] = "male"

    # Extract location type
    if "rural" in query_lower or "village" in query_lower:
        entities["location_type"] = "rural"
    elif "urban" in query_lower or "city" in query_lower or "town" in query_lower:
        entities["location_type"] = "urban"

    # If LLM is enabled, use it for better extraction
    if use_llm:
        try:
            provider = get_llm_provider()
            llm_entities = await provider.generate_structured(
                prompt=query,
                response_schema={},
                system_prompt=SYSTEM_PROMPT_ENTITY_EXTRACTOR,
                temperature=0.1,
                max_tokens=200
            )
            # Merge LLM entities with regex-extracted ones (regex takes priority)
            for key, value in llm_entities.items():
                if key not in entities and value:
                    entities[key] = value
        except Exception as e:
            logger.warning(f"LLM entity extraction failed: {e}")

    logger.debug(f"Extracted entities: {entities}")
    return entities
