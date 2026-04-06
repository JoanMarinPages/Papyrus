from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TemplateCreate(BaseModel):
    name: str
    description: str | None = None
    industry: str | None = None
    sections: list[dict] = []


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    industry: str | None = None
    sections: list[dict] | None = None


class TemplateOut(BaseModel):
    id: UUID
    name: str
    description: str | None
    industry: str | None
    sections: list[dict]
    used_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
