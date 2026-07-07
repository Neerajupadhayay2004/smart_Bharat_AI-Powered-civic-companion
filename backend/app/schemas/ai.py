from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CitationSource(BaseModel):
    title: str
    url: str
    department: Optional[str] = None
    last_verified: Optional[str] = None
    reliability: str = "official"
    evidence_excerpt: Optional[str] = None
    relevance_score: Optional[float] = None


class TransparencyInfo(BaseModel):
    user_info_considered: List[str] = []
    rules_matched: List[str] = []
    sources_retrieved: List[str] = []
    uncertainties: List[str] = []
    reasoning: Optional[str] = None


class RecommendedAction(BaseModel):
    id: str
    label: str
    type: str  # navigate, apply, check, report, escalate, prepare
    target: Optional[str] = None
    description: str
    priority: str  # high, medium, low


class ConfidenceInfo(BaseModel):
    score: float
    level: str  # high, medium, low
    reasons: List[str] = []
    uncertainties: List[str] = []


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    language: Optional[str] = None
    profile: Optional[dict] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    intent: Optional[str] = None
    detected_language: str
    answer: str
    simple_explanation: Optional[str] = None
    follow_up_questions: List[str] = []
    recommended_actions: List[RecommendedAction] = []
    citations: List[CitationSource] = []
    confidence: ConfidenceInfo
    transparency: TransparencyInfo


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str] = None
    language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExplainSimpleRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: Optional[str] = None


class RecommendationsRequest(BaseModel):
    profile: Optional[dict] = None
    recent_activity: Optional[List[dict]] = None
