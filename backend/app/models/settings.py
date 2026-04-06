import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RagSettings(Base):
    __tablename__ = "rag_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, unique=True)

    # Ingestion
    chunk_size: Mapped[int] = mapped_column(Integer, default=512)
    chunk_overlap: Mapped[float] = mapped_column(Float, default=0.15)
    embedding_model: Mapped[str] = mapped_column(String(100), default="voyage-3-large")
    semantic_chunking: Mapped[bool] = mapped_column(Boolean, default=True)

    # Retrieval
    top_k: Mapped[int] = mapped_column(Integer, default=10)
    vector_weight: Mapped[float] = mapped_column(Float, default=0.6)
    reranking: Mapped[bool] = mapped_column(Boolean, default=True)
    crag: Mapped[bool] = mapped_column(Boolean, default=True)

    # Generation
    llm_model: Mapped[str] = mapped_column(String(100), default="claude-sonnet-4-20250514")
    temperature: Mapped[float] = mapped_column(Float, default=0.3)
    max_tokens: Mapped[int] = mapped_column(Integer, default=4096)
    auto_citation: Mapped[bool] = mapped_column(Boolean, default=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
