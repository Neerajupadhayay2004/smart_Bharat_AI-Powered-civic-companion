import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON, Float, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ticket_id = Column(String(100), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    urgency = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="submitted")
    department = Column(String(500), nullable=True)
    assigned_to = Column(String(500), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_address = Column(Text, nullable=True)
    location_area = Column(String(255), nullable=True)
    is_mock = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="complaints")
    attachments = relationship("ComplaintAttachment", back_populates="complaint", cascade="all, delete-orphan")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintAttachment(Base):
    __tablename__ = "complaint_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="attachments")


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="status_history")
