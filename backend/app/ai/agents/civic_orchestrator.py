import uuid
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers import get_llm_provider
from app.ai.agents.intent_classifier import classify_intent
from app.ai.agents.entity_extractor import extract_entities
from app.ai.rag import HybridRetriever, build_citations, validate_grounding
from app.ai.prompts.system_prompts import SYSTEM_PROMPT_CIVIC_ASSISTANT
from app.models import Conversation, Message
from app.schemas.ai import (
    ChatResponse,
    RecommendedAction,
    ConfidenceInfo,
    TransparencyInfo,
    CitationSource
)
from app.core.logging import get_logger

logger = get_logger(__name__)


class CivicOrchestrator:
    """Central orchestrator for civic AI workflows"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm_provider = get_llm_provider()
        self.retriever = HybridRetriever(db)

    async def process_query(
        self,
        query: str,
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        language: str = "en",
        profile: Optional[Dict[str, Any]] = None
    ) -> ChatResponse:
        """
        Process a user query through the complete civic AI pipeline.
        
        Args:
            query: User's query text
            user_id: Optional user ID
            conversation_id: Optional conversation ID
            language: Language code
            profile: Optional user profile
            
        Returns:
            Complete chat response
        """
        logger.info(f"Processing query: {query[:100]}...")

        # 1. Language Detection
        detected_language = await self._detect_language(query, language)

        # 2. Intent Classification
        intent = await classify_intent(query)

        # 3. Entity Extraction
        entities = await extract_entities(query)

        # 4. Merge with profile
        merged_profile = {**(profile or {}), **entities}

        # 5. Retrieve relevant knowledge
        retrieved_chunks = await self.retriever.retrieve(
            query=query,
            state=merged_profile.get("state"),
            department=merged_profile.get("department"),
            top_k=5
        )

        # 6. Build citations
        citations = build_citations(retrieved_chunks)

        # 7. Build context for LLM
        context = self._build_context(retrieved_chunks, merged_profile)

        # 8. Generate response
        system_prompt = SYSTEM_PROMPT_CIVIC_ASSISTANT
        user_prompt = self._build_user_prompt(query, context, detected_language)

        answer = await self.llm_provider.generate_text(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1024
        )

        # 9. Grounding validation
        grounding_result = validate_grounding(answer, citations)

        # 10. Calculate confidence
        confidence = self._calculate_confidence(
            intent,
            retrieved_chunks,
            grounding_result,
            merged_profile
        )

        # 11. Generate recommended actions
        recommended_actions = self._generate_actions(intent, retrieved_chunks, merged_profile)

        # 12. Generate follow-up questions
        follow_up_questions = self._generate_follow_ups(intent, merged_profile)

        # 13. Build transparency info
        transparency = TransparencyInfo(
            user_info_considered=list(merged_profile.keys()),
            rules_matched=[],
            sources_retrieved=[c.title for c in citations],
            uncertainties=[] if confidence["level"] == "high" else ["Limited information available"],
            reasoning=f"Classified intent as {intent} and retrieved {len(retrieved_chunks)} relevant sources."
        )

        # 14. Save to database (if user exists)
        message_id = str(uuid.uuid4())
        if user_id:
            conv_id = await self._save_conversation(
                user_id, conversation_id, query, answer,
                intent, detected_language, citations
            )
            conversation_id = conv_id

        # 15. Return complete response
        return ChatResponse(
            conversation_id=conversation_id or str(uuid.uuid4()),
            message_id=message_id,
            intent=intent,
            detected_language=detected_language,
            answer=answer,
            simple_explanation=None,  # Can be generated separately
            follow_up_questions=follow_up_questions,
            recommended_actions=recommended_actions,
            citations=citations,
            confidence=ConfidenceInfo(**confidence),
            transparency=transparency
        )

    async def _detect_language(self, query: str, preferred: str) -> str:
        """Detect language from query or use preferred"""
        if preferred != "en":
            return preferred

        # Simple heuristic detection
        devanagari_chars = sum(1 for c in query if '\u0900' <= c <= '\u097F')
        if devanagari_chars > 0:
            return "hi"

        # Check for Hinglish keywords
        hinglish_keywords = ["hai", "kya", "kaise", "kar", "nahi", "ho", "ka", "ki", "ne", "se", "ko", "mein", "mera", "mujhe"]
        query_lower = query.lower()
        hinglish_count = sum(1 for kw in hinglish_keywords if f" {kw} " in f" {query_lower} ")
        if hinglish_count >= 2:
            return "hinglish"

        return "en"

    def _build_context(self, chunks: List[Dict], profile: Dict) -> str:
        """Build context string from retrieved chunks and profile"""
        context_parts = []

        # Profile info
        if profile:
            profile_str = "User Profile:\n"
            for key, value in profile.items():
                if value:
                    profile_str += f"- {key}: {value}\n"
            context_parts.append(profile_str)

        # Retrieved knowledge
        if chunks:
            context_parts.append("\nRetrieved Information:\n")
            for i, chunk in enumerate(chunks[:3], 1):
                context_parts.append(f"\n[{i}] {chunk['text'][:300]}...")
                context_parts.append(f"Source: {chunk['source_name']} ({chunk['source_url']})")

        return "\n".join(context_parts)

    def _build_user_prompt(self, query: str, context: str, language: str) -> str:
        """Build the user prompt for LLM"""
        return f"""Context:
{context}

User Query: {query}

Language: {language}

Please provide a helpful response based on the context above."""

    def _calculate_confidence(
        self,
        intent: str,
        chunks: List[Dict],
        grounding: Dict,
        profile: Dict
    ) -> Dict[str, Any]:
        """Calculate confidence score based on multiple factors"""
        score = 0.0
        reasons = []
        uncertainties = []

        # Factor 1: Number of retrieved chunks
        if len(chunks) >= 3:
            score += 0.3
            reasons.append("Multiple relevant sources found")
        elif len(chunks) >= 1:
            score += 0.15
            reasons.append("Some relevant sources found")
        else:
            uncertainties.append("No relevant sources retrieved")

        # Factor 2: Grounding result
        if grounding.get("is_grounded"):
            score += 0.3
            reasons.append("Response grounded in sources")
        else:
            uncertainties.append("Response may not be fully grounded")

        # Factor 3: Profile completeness
        profile_fields = ["age", "state", "income", "occupation"]
        profile_complete = sum(1 for f in profile_fields if profile.get(f))
        if profile_complete >= 3:
            score += 0.2
            reasons.append("Comprehensive user profile")
        elif profile_complete >= 1:
            score += 0.1
            reasons.append("Some user profile information")
        else:
            uncertainties.append("Limited user profile information")

        # Factor 4: Intent clarity
        if intent not in ["unknown", "general_civic_query"]:
            score += 0.2
            reasons.append("Clear user intent")
        else:
            uncertainties.append("Unclear user intent")

        # Normalize to 0-1
        final_score = min(score, 1.0)

        # Determine level
        if final_score >= 0.7:
            level = "high"
        elif final_score >= 0.4:
            level = "medium"
        else:
            level = "low"

        return {
            "score": final_score,
            "level": level,
            "reasons": reasons,
            "uncertainties": uncertainties
        }

    def _generate_actions(
        self,
        intent: str,
        chunks: List[Dict],
        profile: Dict
    ) -> List[RecommendedAction]:
        """Generate recommended next actions"""
        actions = []

        if intent == "scheme_discovery":
            actions.append(RecommendedAction(
                id="view_schemes",
                label="View Relevant Schemes",
                type="navigate",
                target="/schemes",
                description="Browse all relevant government schemes",
                priority="high"
            ))
        elif intent == "complaint_creation":
            actions.append(RecommendedAction(
                id="file_complaint",
                label="File a Complaint",
                type="report",
                target="/report",
                description="File an official complaint with AI assistance",
                priority="high"
            ))

        actions.append(RecommendedAction(
            id="update_profile",
            label="Complete Profile",
            type="navigate",
            target="/profile",
            description="Get better recommendations by completing your profile",
            priority="medium"
        ))

        return actions

    def _generate_follow_ups(self, intent: str, profile: Dict) -> List[str]:
        """Generate follow-up questions"""
        questions = []

        if intent == "scheme_discovery":
            if not profile.get("state"):
                questions.append("Which state do you live in?")
            if not profile.get("income"):
                questions.append("What is your annual family income?")
            if not profile.get("occupation"):
                questions.append("What is your occupation?")

        if intent == "complaint_creation":
            questions.append("Would you like to file this as an official complaint?")
            questions.append("Do you have any photos or documents to attach?")

        return questions[:3]

    async def _save_conversation(
        self,
        user_id: str,
        conversation_id: Optional[str],
        query: str,
        answer: str,
        intent: str,
        language: str,
        citations: List[CitationSource]
    ) -> str:
        """Save conversation and messages to database"""
        if not conversation_id:
            # Create new conversation
            conv = Conversation(
                user_id=uuid.UUID(user_id),
                title=query[:50] + "..." if len(query) > 50 else query,
                language=language
            )
            self.db.add(conv)
            await self.db.commit()
            await self.db.refresh(conv)
            conversation_id = str(conv.id)
        else:
            # Update existing conversation
            conv = await self.db.get(Conversation, uuid.UUID(conversation_id))
            if conv:
                conv.updated_at = conv.updated_at  # Trigger update

        # Save user message
        user_msg = Message(
            conversation_id=uuid.UUID(conversation_id),
            role="user",
            content=query,
            intent=intent,
            detected_language=language
        )
        self.db.add(user_msg)

        # Save assistant message
        import json
        assistant_msg = Message(
            conversation_id=uuid.UUID(conversation_id),
            role="assistant",
            content=answer,
            intent=intent,
            detected_language=language,
            sources=json.dumps([c.model_dump() for c in citations])
        )
        self.db.add(assistant_msg)

        await self.db.commit()
        return conversation_id
