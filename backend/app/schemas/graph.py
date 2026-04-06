from uuid import UUID

from pydantic import BaseModel


class GraphNodeOut(BaseModel):
    id: UUID
    label: str
    type: str
    connections: int = 0

    model_config = {"from_attributes": True}


class GraphEdgeOut(BaseModel):
    id: UUID
    source_id: UUID
    target_id: UUID
    relation: str

    model_config = {"from_attributes": True}


class GraphStats(BaseModel):
    total_nodes: int
    documents: int
    persons: int
    organizations: int
    concepts: int
    total_edges: int
