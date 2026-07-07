from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.common import TimestampMixin


class Location(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None


class ComplaintStatusEventBase(BaseModel):
    status: str
    note: Optional[str] = None
    by: Optional[str] = None


class ComplaintStatusEventResponse(ComplaintStatusEventBase):
    id: str
    complaint_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    urgency: str
    location: Optional[Location] = None


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    location: Optional[Location] = None


class ComplaintResponse(ComplaintBase, TimestampMixin):
    id: str
    user_id: str
    ticket_id: str
    status: str
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    is_mock: bool
    status_history: Optional[List[ComplaintStatusEventResponse]] = None

    class Config:
        from_attributes = True


class ComplaintAnalysisRequest(BaseModel):
    description: str
    category: Optional[str] = None
    location: Optional[str] = None


class ComplaintAnalysisResponse(BaseModel):
    title: str
    body: str
    urgency: str
    department: str
    category: str
