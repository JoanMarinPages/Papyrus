import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.document import Document
from app.schemas.analytics import AnalyticsOverview, TimeSeriesPoint, DocumentTypeCount

router = APIRouter(prefix="/analytics", tags=["Analytics"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("", response_model=AnalyticsOverview)
async def get_analytics(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(days=days)

    # Time series - documents processed per day
    ts_query = (
        select(
            cast(Document.created_at, Date).label("date"),
            func.count().label("count"),
        )
        .where(Document.tenant_id == DEMO_TENANT, Document.created_at >= since)
        .group_by(cast(Document.created_at, Date))
        .order_by(cast(Document.created_at, Date))
    )
    ts_result = await db.execute(ts_query)
    time_series = [
        TimeSeriesPoint(date=str(row.date), processed=row.count, generated=0)
        for row in ts_result
    ]

    # Document types distribution
    type_query = (
        select(Document.type, func.count().label("count"))
        .where(Document.tenant_id == DEMO_TENANT)
        .group_by(Document.type)
    )
    type_result = await db.execute(type_query)
    document_types = [
        DocumentTypeCount(type=row.type, count=row.count)
        for row in type_result
    ]

    return AnalyticsOverview(
        time_series=time_series,
        document_types=document_types,
        avg_latency_ms=0.0,
        avg_accuracy=0.0,
    )
