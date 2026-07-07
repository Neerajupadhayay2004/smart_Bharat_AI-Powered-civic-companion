import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.api.deps import get_db, get_current_active_user
from app.models import Complaint, ComplaintStatusHistory, User
from app.schemas import (
    ComplaintResponse,
    ComplaintCreate,
    ComplaintUpdate,
    Location,
    ComplaintStatusEventResponse
)
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint_in: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new complaint"""
    # Generate ticket ID
    ticket_id = f"SB-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"

    complaint = Complaint(
        user_id=current_user.id,
        ticket_id=ticket_id,
        title=complaint_in.title,
        description=complaint_in.description,
        category=complaint_in.category,
        urgency=complaint_in.urgency,
        status="submitted",
        department=complaint_in.department if hasattr(complaint_in, 'department') else None,
        location_lat=complaint_in.location.lat if complaint_in.location else None,
        location_lng=complaint_in.location.lng if complaint_in.location else None,
        location_address=complaint_in.location.address if complaint_in.location else None,
        location_area=complaint_in.location.area if complaint_in.location else None,
        is_mock=False
    )
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)

    # Add initial status history
    status_event = ComplaintStatusHistory(
        complaint_id=complaint.id,
        status="submitted",
        note="Complaint submitted via Smart Bharat AI",
        by="System"
    )
    db.add(status_event)
    await db.commit()

    logger.info(f"Complaint created: {ticket_id}")

    return ComplaintResponse(
        id=str(complaint.id),
        user_id=str(complaint.user_id),
        ticket_id=complaint.ticket_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        urgency=complaint.urgency,
        status=complaint.status,
        department=complaint.department,
        location=Location(
            lat=complaint.location_lat,
            lng=complaint.location_lng,
            address=complaint.location_address,
            area=complaint.location_area
        ) if complaint.location_lat else None,
        is_mock=complaint.is_mock,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )


@router.get("", response_model=List[ComplaintResponse])
async def get_complaints(
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's complaints"""
    stmt = select(Complaint).where(Complaint.user_id == current_user.id)

    if status_filter:
        stmt = stmt.where(Complaint.status == status_filter)

    if category_filter:
        stmt = stmt.where(Complaint.category == category_filter)

    stmt = stmt.order_by(desc(Complaint.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    complaints = result.scalars().all()

    return [
        ComplaintResponse(
            id=str(c.id),
            user_id=str(c.user_id),
            ticket_id=c.ticket_id,
            title=c.title,
            description=c.description,
            category=c.category,
            urgency=c.urgency,
            status=c.status,
            department=c.department,
            location=Location(
                lat=c.location_lat,
                lng=c.location_lng,
                address=c.location_address,
                area=c.location_area
            ) if c.location_lat else None,
            is_mock=c.is_mock,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in complaints
    ]


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single complaint by ID"""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id
        )
    )
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Get status history
    history_result = await db.execute(
        select(ComplaintStatusHistory).where(
            ComplaintStatusHistory.complaint_id == complaint.id
        ).order_by(ComplaintStatusHistory.created_at)
    )
    status_history = history_result.scalars().all()

    return ComplaintResponse(
        id=str(complaint.id),
        user_id=str(complaint.user_id),
        ticket_id=complaint.ticket_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        urgency=complaint.urgency,
        status=complaint.status,
        department=complaint.department,
        location=Location(
            lat=complaint.location_lat,
            lng=complaint.location_lng,
            address=complaint.location_address,
            area=complaint.location_area
        ) if complaint.location_lat else None,
        is_mock=complaint.is_mock,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        status_history=[
            ComplaintStatusEventResponse(
                id=str(e.id),
                complaint_id=str(e.complaint_id),
                status=e.status,
                note=e.note,
                by=e.by,
                created_at=e.created_at
            )
            for e in status_history
        ]
    )


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: str,
    complaint_in: ComplaintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a complaint"""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id
        )
    )
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Update fields
    update_data = complaint_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "location":
            complaint.location_lat = value.get("lat")
            complaint.location_lng = value.get("lng")
            complaint.location_address = value.get("address")
            complaint.location_area = value.get("area")
        else:
            setattr(complaint, field, value)

    await db.commit()
    await db.refresh(complaint)

    return ComplaintResponse(
        id=str(complaint.id),
        user_id=str(complaint.user_id),
        ticket_id=complaint.ticket_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        urgency=complaint.urgency,
        status=complaint.status,
        department=complaint.department,
        location=Location(
            lat=complaint.location_lat,
            lng=complaint.location_lng,
            address=complaint.location_address,
            area=complaint.location_area
        ) if complaint.location_lat else None,
        is_mock=complaint.is_mock,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at
    )
