from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.schemas.common import TimestampMixin


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase, TimestampMixin):
    id: str
    is_active: bool
    is_verified: bool
    is_superuser: bool

    class Config:
        from_attributes = True
