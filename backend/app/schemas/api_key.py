from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    name: str
    type: str = "development"


class ApiKeyOut(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    type: str
    requests_count: int
    last_used_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyCreated(ApiKeyOut):
    """Returned only on creation - includes full key (only time it's visible)."""
    full_key: str
