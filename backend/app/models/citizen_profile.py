import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    occupation = Column(String(255), nullable=True)
    is_student = Column(Boolean, default=False)
    income_range = Column(String(100), nullable=True)
    gender = Column(String(50), nullable=True)
    has_disability = Column(Boolean, default=False)
    location_type = Column(String(50), nullable=True)  # rural/urban
    is_farmer = Column(Boolean, default=False)
    employment_status = Column(String(100), nullable=True)
    preferred_language = Column(String(50), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
