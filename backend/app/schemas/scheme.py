from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.common import TimestampMixin


class EligibilityRuleBase(BaseModel):
    label: str
    description: Optional[str] = None
    field: str
    operator: str
    value: str


class EligibilityRuleResponse(EligibilityRuleBase, TimestampMixin):
    id: str
    scheme_id: str

    class Config:
        from_attributes = True


class GovernmentSchemeBase(BaseModel):
    name: str
    name_hi: Optional[str] = None
    category: str
    department: str
    short_description: str
    description: str
    eligibility_summary: Optional[str] = None
    required_documents: Optional[List[str]] = None
    application_process: Optional[List[str]] = None
    official_source: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[datetime] = None
    availability: Optional[str] = "national"
    states: Optional[List[str]] = None
    application_deadline: Optional[str] = None
    benefits: Optional[str] = None
    tags: Optional[List[str]] = None


class GovernmentSchemeCreate(GovernmentSchemeBase):
    pass


class GovernmentSchemeUpdate(BaseModel):
    name: Optional[str] = None
    name_hi: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    eligibility_summary: Optional[str] = None
    required_documents: Optional[List[str]] = None
    application_process: Optional[List[str]] = None
    official_source: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[datetime] = None
    availability: Optional[str] = None
    states: Optional[List[str]] = None
    application_deadline: Optional[str] = None
    benefits: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class GovernmentSchemeResponse(GovernmentSchemeBase, TimestampMixin):
    id: str
    is_active: bool
    eligibility_rules: Optional[List[EligibilityRuleResponse]] = None

    class Config:
        from_attributes = True


class SchemeSearchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    tags: Optional[List[str]] = None
