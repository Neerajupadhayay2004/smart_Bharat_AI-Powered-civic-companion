import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("government_schemes.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    field = Column(String(255), nullable=False)  # e.g., "age", "income", "caste"
    operator = Column(String(50), nullable=False)  # eq, lt, lte, gt, gte, in, bool
    value = Column(Text, nullable=False)  # Stored as string, parsed based on operator
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scheme = relationship("GovernmentScheme", back_populates="eligibility_rules")
