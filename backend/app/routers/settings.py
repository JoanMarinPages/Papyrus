import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.settings import RagSettings
from app.schemas.analytics import RagSettingsOut, RagSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


async def _get_or_create_settings(db: AsyncSession) -> RagSettings:
    result = await db.execute(
        select(RagSettings).where(RagSettings.tenant_id == DEMO_TENANT)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        settings = RagSettings(tenant_id=DEMO_TENANT)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


@router.get("/rag", response_model=RagSettingsOut)
async def get_rag_settings(db: AsyncSession = Depends(get_db)):
    settings = await _get_or_create_settings(db)
    return RagSettingsOut.model_validate(settings)


@router.put("/rag", response_model=RagSettingsOut)
async def update_rag_settings(data: RagSettingsUpdate, db: AsyncSession = Depends(get_db)):
    settings = await _get_or_create_settings(db)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)

    await db.commit()
    await db.refresh(settings)
    return RagSettingsOut.model_validate(settings)


@router.get("/database/status")
async def get_database_status(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text
        await db.execute(text("SELECT 1"))
        return {"status": "connected", "provider": "Supabase PostgreSQL"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}
