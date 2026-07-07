import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(500), nullable=False)
    name_hi = Column(String(500), nullable=True)
    category = Column(String(100), nullable=False)
    department = Column(String(500), nullable=False)
    short_description = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    eligibility_summary = Column(Text, nullable=True)
    required_documents = Column(JSONB, nullable=True)  # List of strings
    application_process = Column(JSONB, nullable=True)  # List of strings
    official_source = Column(String(500), nullable=True)
    source_url = Column(String(1000), nullable=True)
    last_verified = Column(DateTime, nullable=True)
    availability = Column(String(100), default="national")
    states = Column(JSONB, nullable=True)  # List of state names
    application_deadline = Column(String(255), nullable=True)
    benefits = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)  # List of strings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    eligibility_rules = relationship("SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    document_checklists = relationship("DocumentChecklist", back_populates="scheme", cascade="all, delete-orphan")
