from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CivicJourneyEventBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    related_id: Optional[str] = None
    related_type: Optional[str] = None
    icon: Optional[str] = None
    metadata: Optional[dict] = None


class CivicJourneyEventCreate(CivicJourneyEventBase):
    pass


class CivicJourneyEventResponse(CivicJourneyEventBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class NextActionsRequest(BaseModel):
    profile: Optional[dict] = None
    recent_events: Optional[List[str]] = None


class NextActionsResponse(BaseModel):
    actions: List[dict]
    reasoning: str
