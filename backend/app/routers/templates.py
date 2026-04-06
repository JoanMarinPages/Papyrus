import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateOut

router = APIRouter(prefix="/templates", tags=["Templates"])

DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("", response_model=list[TemplateOut])
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Template).where(Template.tenant_id == DEMO_TENANT).order_by(Template.created_at.desc())
    )
    return [TemplateOut.model_validate(t) for t in result.scalars().all()]


@router.post("", response_model=TemplateOut, status_code=201)
async def create_template(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = Template(tenant_id=DEMO_TENANT, **data.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return TemplateOut.model_validate(template)


@router.get("/{template_id}", response_model=TemplateOut)
async def get_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Template).where(Template.id == template_id, Template.tenant_id == DEMO_TENANT)
    )
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Template no encontrado")
    return TemplateOut.model_validate(t)


@router.put("/{template_id}", response_model=TemplateOut)
async def update_template(
    template_id: uuid.UUID,
    data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Template).where(Template.id == template_id, Template.tenant_id == DEMO_TENANT)
    )
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Template no encontrado")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(t, key, value)

    await db.commit()
    await db.refresh(t)
    return TemplateOut.model_validate(t)


@router.delete("/{template_id}")
async def delete_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Template).where(Template.id == template_id, Template.tenant_id == DEMO_TENANT)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Template no encontrado")

    await db.execute(delete(Template).where(Template.id == template_id))
    await db.commit()
    return {"message": "Template eliminado"}


@router.post("/{template_id}/duplicate", response_model=TemplateOut, status_code=201)
async def duplicate_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Template).where(Template.id == template_id, Template.tenant_id == DEMO_TENANT)
    )
    original = result.scalar_one_or_none()
    if not original:
        raise HTTPException(status_code=404, detail="Template no encontrado")

    copy = Template(
        tenant_id=DEMO_TENANT,
        name=f"{original.name} (copia)",
        description=original.description,
        industry=original.industry,
        sections=original.sections,
    )
    db.add(copy)
    await db.commit()
    await db.refresh(copy)
    return TemplateOut.model_validate(copy)
