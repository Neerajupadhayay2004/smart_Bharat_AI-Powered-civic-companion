import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class OfficialSource(Base):
    __tablename__ = "official_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String(500), nullable=False)
    official_url = Column(String(1000), nullable=False)
    department = Column(String(500), nullable=True)
    jurisdiction = Column(String(255), nullable=True)  # national/state
    source_type = Column(String(255), nullable=True)  # scheme, circular, form, etc.
    retrieved_at = Column(DateTime, nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    content_hash = Column(String(64), nullable=True)  # For detecting changes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    documents = relationship("KnowledgeDocument", back_populates="source", cascade="all, delete-orphan")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("official_sources.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    doc_metadata = Column(JSONB, nullable=True)
    content_hash = Column(String(64), nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source = relationship("OfficialSource", back_populates="documents")
    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    section_title = Column(String(500), nullable=True)
    page_number = Column(String(50), nullable=True)
    chunk_metadata = Column(JSONB, nullable=True)
    embedding = Column(Vector(768), nullable=True)  # Gemini embedding dimension
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("KnowledgeDocument", back_populates="chunks")
