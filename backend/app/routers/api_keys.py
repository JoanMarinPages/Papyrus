import uuid
import secrets
import hashlib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut, ApiKeyCreated

router = APIRouter(prefix="/api-keys", tags=["API Keys"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


def _generate_key() -> tuple[str, str, str]:
    """Returns (full_key, key_hash, key_prefix)."""
    raw = f"ppk_{secrets.token_urlsafe(32)}"
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    prefix = raw[:12]
    return raw, hashed, prefix


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiKey).where(ApiKey.tenant_id == DEMO_TENANT).order_by(ApiKey.created_at.desc())
    )
    return [ApiKeyOut.model_validate(k) for k in result.scalars().all()]


@router.post("", response_model=ApiKeyCreated, status_code=201)
async def create_api_key(data: ApiKeyCreate, db: AsyncSession = Depends(get_db)):
    full_key, key_hash, key_prefix = _generate_key()

    key = ApiKey(
        tenant_id=DEMO_TENANT,
        name=data.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        type=data.type,
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)

    out = ApiKeyCreated.model_validate(key)
    out.full_key = full_key
    return out


@router.post("/{key_id}/regenerate", response_model=ApiKeyCreated)
async def regenerate_key(key_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.tenant_id == DEMO_TENANT)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API Key no encontrada")

    full_key, key_hash, key_prefix = _generate_key()
    key.key_hash = key_hash
    key.key_prefix = key_prefix
    await db.commit()
    await db.refresh(key)

    out = ApiKeyCreated.model_validate(key)
    out.full_key = full_key
    return out


@router.delete("/{key_id}")
async def revoke_key(key_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.tenant_id == DEMO_TENANT)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="API Key no encontrada")

    await db.execute(delete(ApiKey).where(ApiKey.id == key_id))
    await db.commit()
    return {"message": "API Key revocada"}
