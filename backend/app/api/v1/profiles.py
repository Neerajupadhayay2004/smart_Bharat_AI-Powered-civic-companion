from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models import User, CitizenProfile
from app.schemas import CitizenProfileResponse, CitizenProfileUpdate
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=CitizenProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    result = await db.execute(
        CitizenProfile.__table__.select().where(CitizenProfile.user_id == current_user.id)
    )
    profile_row = result.first()

    if not profile_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return CitizenProfileResponse(
        id=str(profile_row.id),
        user_id=str(profile_row.user_id),
        age=profile_row.age,
        state=profile_row.state,
        district=profile_row.district,
        occupation=profile_row.occupation,
        is_student=profile_row.is_student,
        income_range=profile_row.income_range,
        gender=profile_row.gender,
        has_disability=profile_row.has_disability,
        location_type=profile_row.location_type,
        is_farmer=profile_row.is_farmer,
        employment_status=profile_row.employment_status,
        preferred_language=profile_row.preferred_language,
        created_at=profile_row.created_at,
        updated_at=profile_row.updated_at
    )


@router.put("", response_model=CitizenProfileResponse)
@router.patch("", response_model=CitizenProfileResponse)
async def update_profile(
    profile_in: CitizenProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user's profile"""
    from sqlalchemy import select

    result = await db.execute(
        select(CitizenProfile).where(CitizenProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Update fields
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    logger.info(f"Profile updated for user: {current_user.email}")

    return CitizenProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        age=profile.age,
        state=profile.state,
        district=profile.district,
        occupation=profile.occupation,
        is_student=profile.is_student,
        income_range=profile.income_range,
        gender=profile.gender,
        has_disability=profile.has_disability,
        location_type=profile.location_type,
        is_farmer=profile.is_farmer,
        employment_status=profile.employment_status,
        preferred_language=profile.preferred_language,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )
