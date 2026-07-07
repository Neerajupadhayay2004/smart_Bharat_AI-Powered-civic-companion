from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas import ChatRequest, ChatResponse
from app.ai.agents import CivicOrchestrator
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    chat_in: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Process a chat query with the civic AI orchestrator"""
    orchestrator = CivicOrchestrator(db)

    user_id = str(current_user.id) if current_user else None
    profile = {}

    # Get profile from current user if available
    if current_user and current_user.profile:
        profile = {
            "age": current_user.profile.age,
            "state": current_user.profile.state,
            "district": current_user.profile.district,
            "occupation": current_user.profile.occupation,
            "is_student": current_user.profile.is_student,
            "income_range": current_user.profile.income_range,
            "gender": current_user.profile.gender,
            "has_disability": current_user.profile.has_disability,
            "location_type": current_user.profile.location_type,
            "is_farmer": current_user.profile.is_farmer,
            "employment_status": current_user.profile.employment_status
        }

    # Merge with profile from request if provided
    if chat_in.profile:
        profile.update(chat_in.profile)

    response = await orchestrator.process_query(
        query=chat_in.message,
        user_id=user_id,
        conversation_id=chat_in.conversation_id,
        language=chat_in.language or "en",
        profile=profile
    )

    return response


@router.post("/explain-simple")
async def explain_simple():
    """Explain text in simple language"""
    return {"message": "Simple explanation endpoint"}


@router.post("/translate")
async def translate():
    """Translate text between languages"""
    return {"message": "Translation endpoint"}


@router.post("/recommendations")
async def get_recommendations():
    """Get personalized recommendations"""
    return {"message": "Recommendations endpoint"}
