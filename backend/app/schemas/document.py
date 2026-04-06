from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentOut(BaseModel):
    id: UUID
    name: str
    type: str
    status: str
    file_size: int | None = None
    chunks_count: int = 0
    entities_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentDetail(DocumentOut):
    file_path: str | None = None


class DocumentList(BaseModel):
    documents: list[DocumentOut]
    total: int
    page: int
    page_size: int


class DocumentUploadResponse(BaseModel):
    id: UUID
    name: str
    status: str = "processing"
    message: str = "Documento subido correctamente. Procesamiento iniciado."
