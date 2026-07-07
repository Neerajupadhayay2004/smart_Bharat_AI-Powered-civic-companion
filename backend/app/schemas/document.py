from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.common import TimestampMixin


class DocumentChecklistBase(BaseModel):
    name: str
    description: Optional[str] = None
    required: bool = True
    order: int = 0


class DocumentChecklistResponse(DocumentChecklistBase, TimestampMixin):
    id: str
    scheme_id: str

    class Config:
        from_attributes = True


class ExtractedField(BaseModel):
    label: str
    value: str
    masked: bool


class DocumentAnalysisBase(BaseModel):
    document_type: Optional[str] = None
    extracted_fields: Optional[List[ExtractedField]] = None
    readability: Optional[int] = None
    issues: Optional[List[str]] = None
    status: Optional[str] = None


class DocumentAnalysisResponse(DocumentAnalysisBase, TimestampMixin):
    id: str
    document_id: str

    class Config:
        from_attributes = True


class UserDocumentBase(BaseModel):
    checklist_item_id: Optional[str] = None
    status: Optional[str] = "pending"


class UserDocumentCreate(UserDocumentBase):
    pass


class UserDocumentUpdate(BaseModel):
    status: Optional[str] = None


class UserDocumentResponse(UserDocumentBase, TimestampMixin):
    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: Optional[int] = None
    analysis: Optional[DocumentAnalysisResponse] = None

    class Config:
        from_attributes = True


class DocumentAnalysisRequest(BaseModel):
    file_name: str
    file_type: str
    file_path: Optional[str] = None


class DocumentReadinessResponse(BaseModel):
    total_documents: int
    completed_documents: int
    readiness_score: float
    missing_documents: List[DocumentChecklistResponse]
    completed_checklist: List[DocumentChecklistResponse]
    recommendations: List[str]
