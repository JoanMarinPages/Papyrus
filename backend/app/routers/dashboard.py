import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.document import Document
from app.models.graph import GraphNode
from app.schemas.analytics import DashboardStats, RecentDocument
from app.schemas.document import DocumentOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Documents indexed
    docs_count = (await db.execute(
        select(func.count()).where(Document.tenant_id == DEMO_TENANT, Document.status == "indexed")
    )).scalar() or 0

    # Graph nodes
    nodes_count = (await db.execute(
        select(func.count()).where(GraphNode.tenant_id == DEMO_TENANT)
    )).scalar() or 0

    return DashboardStats(
        documents_indexed=docs_count,
        graph_nodes=nodes_count,
        docs_generated=0,  # TODO: track generated documents
        rag_accuracy=0.0,
    )


@router.get("/recent", response_model=list[DocumentOut])
async def get_recent_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Document)
        .where(Document.tenant_id == DEMO_TENANT)
        .order_by(Document.created_at.desc())
        .limit(5)
    )
    docs = result.scalars().all()
    return [DocumentOut.model_validate(d) for d in docs]
