import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.graph import GraphNode, GraphEdge
from app.schemas.graph import GraphNodeOut, GraphEdgeOut, GraphStats

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("/nodes", response_model=list[GraphNodeOut])
async def list_nodes(
    type: str | None = None,
    search: str | None = None,
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    query = select(GraphNode).where(GraphNode.tenant_id == DEMO_TENANT)

    if type and type != "all":
        query = query.where(GraphNode.type == type)
    if search:
        query = query.where(GraphNode.label.ilike(f"%{search}%"))

    query = query.limit(limit)
    result = await db.execute(query)
    nodes = result.scalars().all()

    # Count connections per node
    out = []
    for node in nodes:
        conn_count = (await db.execute(
            select(func.count()).where(
                (GraphEdge.source_id == node.id) | (GraphEdge.target_id == node.id)
            )
        )).scalar() or 0
        n = GraphNodeOut.model_validate(node)
        n.connections = conn_count
        out.append(n)

    return out


@router.get("/edges", response_model=list[GraphEdgeOut])
async def list_edges(
    limit: int = Query(200, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GraphEdge).where(GraphEdge.tenant_id == DEMO_TENANT).limit(limit)
    )
    return [GraphEdgeOut.model_validate(e) for e in result.scalars().all()]


@router.get("/stats", response_model=GraphStats)
async def get_graph_stats(db: AsyncSession = Depends(get_db)):
    base = select(func.count()).where(GraphNode.tenant_id == DEMO_TENANT)

    total = (await db.execute(base)).scalar() or 0
    documents = (await db.execute(base.where(GraphNode.type == "document"))).scalar() or 0
    persons = (await db.execute(base.where(GraphNode.type == "person"))).scalar() or 0
    organizations = (await db.execute(base.where(GraphNode.type == "organization"))).scalar() or 0
    concepts = (await db.execute(base.where(GraphNode.type == "concept"))).scalar() or 0
    edges = (await db.execute(
        select(func.count()).where(GraphEdge.tenant_id == DEMO_TENANT)
    )).scalar() or 0

    return GraphStats(
        total_nodes=total,
        documents=documents,
        persons=persons,
        organizations=organizations,
        concepts=concepts,
        total_edges=edges,
    )
