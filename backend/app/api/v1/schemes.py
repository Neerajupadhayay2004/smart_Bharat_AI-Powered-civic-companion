from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models import GovernmentScheme, User
from app.schemas import (
    GovernmentSchemeResponse,
    SchemeSearchRequest,
    PaginationParams
)
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=List[GovernmentSchemeResponse])
async def get_schemes(
    category: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Get list of government schemes with filters"""
    stmt = select(GovernmentScheme).where(GovernmentScheme.is_active == True)

    if category:
        stmt = stmt.where(GovernmentScheme.category.ilike(f"%{category}%"))

    if state:
        stmt = stmt.where(
            or_(
                GovernmentScheme.availability == "national",
                GovernmentScheme.states.contains([state])
            )
        )

    if search:
        stmt = stmt.where(
            or_(
                GovernmentScheme.name.ilike(f"%{search}%"),
                GovernmentScheme.description.ilike(f"%{search}%"),
                GovernmentScheme.short_description.ilike(f"%{search}%")
            )
        )

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    schemes = result.scalars().all()

    return [
        GovernmentSchemeResponse(
            id=str(s.id),
            name=s.name,
            name_hi=s.name_hi,
            category=s.category,
            department=s.department,
            short_description=s.short_description,
            description=s.description,
            eligibility_summary=s.eligibility_summary,
            required_documents=s.required_documents,
            application_process=s.application_process,
            official_source=s.official_source,
            source_url=s.source_url,
            last_verified=s.last_verified,
            availability=s.availability,
            states=s.states,
            application_deadline=s.application_deadline,
            benefits=s.benefits,
            tags=s.tags,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        for s in schemes
    ]


@router.get("/{scheme_id}", response_model=GovernmentSchemeResponse)
async def get_scheme(
    scheme_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Get a single scheme by ID"""
    result = await db.execute(
        select(GovernmentScheme).where(GovernmentScheme.id == scheme_id)
    )
    scheme = result.scalar_one_or_none()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )

    return GovernmentSchemeResponse(
        id=str(scheme.id),
        name=scheme.name,
        name_hi=scheme.name_hi,
        category=scheme.category,
        department=scheme.department,
        short_description=scheme.short_description,
        description=scheme.description,
        eligibility_summary=scheme.eligibility_summary,
        required_documents=scheme.required_documents,
        application_process=scheme.application_process,
        official_source=scheme.official_source,
        source_url=scheme.source_url,
        last_verified=scheme.last_verified,
        availability=scheme.availability,
        states=scheme.states,
        application_deadline=scheme.application_deadline,
        benefits=scheme.benefits,
        tags=scheme.tags,
        created_at=scheme.created_at,
        updated_at=scheme.updated_at
    )


@router.post("/search", response_model=List[GovernmentSchemeResponse])
async def search_schemes(
    search_in: SchemeSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Search schemes with advanced filters"""
    stmt = select(GovernmentScheme).where(GovernmentScheme.is_active == True)

    if search_in.query:
        stmt = stmt.where(
            or_(
                GovernmentScheme.name.ilike(f"%{search_in.query}%"),
                GovernmentScheme.description.ilike(f"%{search_in.query}%")
            )
        )

    if search_in.category:
        stmt = stmt.where(GovernmentScheme.category == search_in.category)

    if search_in.state:
        stmt = stmt.where(
            or_(
                GovernmentScheme.availability == "national",
                GovernmentScheme.states.contains([search_in.state])
            )
        )

    if search_in.tags:
        stmt = stmt.where(GovernmentScheme.tags.contains(search_in.tags))

    result = await db.execute(stmt.limit(20))
    schemes = result.scalars().all()

    return [
        GovernmentSchemeResponse(
            id=str(s.id),
            name=s.name,
            name_hi=s.name_hi,
            category=s.category,
            department=s.department,
            short_description=s.short_description,
            description=s.description,
            eligibility_summary=s.eligibility_summary,
            required_documents=s.required_documents,
            application_process=s.application_process,
            official_source=s.official_source,
            source_url=s.source_url,
            last_verified=s.last_verified,
            availability=s.availability,
            states=s.states,
            application_deadline=s.application_deadline,
            benefits=s.benefits,
            tags=s.tags,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        for s in schemes
    ]
