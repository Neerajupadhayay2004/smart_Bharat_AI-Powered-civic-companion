from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import TimestampMixin


class CitizenProfileBase(BaseModel):
    age: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    is_student: Optional[bool] = None
    income_range: Optional[str] = None
    gender: Optional[str] = None
    has_disability: Optional[bool] = None
    location_type: Optional[str] = None
    is_farmer: Optional[bool] = None
    employment_status: Optional[str] = None
    preferred_language: Optional[str] = "en"


class CitizenProfileCreate(CitizenProfileBase):
    pass


class CitizenProfileUpdate(CitizenProfileBase):
    pass


class CitizenProfileResponse(CitizenProfileBase, TimestampMixin):
    id: str
    user_id: str

    class Config:
        from_attributes = True
