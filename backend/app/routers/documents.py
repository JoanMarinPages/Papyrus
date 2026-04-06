import uuid
from typing import Literal

from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentOut, DocumentList, DocumentDetail, DocumentUploadResponse
from app.services.storage import upload_file
from app.services.pipeline import process_document

router = APIRouter(prefix="/documents", tags=["Documents"])

# Hardcoded tenant for now — will come from auth later
DEMO_TENANT = uuid.UUID("00000000-0000-0000-0000-000000000001")

FILE_TYPE_MAP = {
    "pdf": "Contrato",
    "docx": "Informe",
    "doc": "Informe",
    "txt": "Manual",
    "xlsx": "Datos",
    "csv": "Datos",
    "md": "Manual",
}


@router.get("", response_model=DocumentList)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    type: str | None = None,
    sort: Literal["recent", "oldest", "name"] = "recent",
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Document).where(Document.tenant_id == DEMO_TENANT)

    if status:
        query = query.where(Document.status == status)
    if type:
        query = query.where(Document.type == type)
    if search:
        query = query.where(Document.name.ilike(f"%{search}%"))

    if sort == "recent":
        query = query.order_by(Document.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(Document.created_at.asc())
    else:
        query = query.order_by(Document.name.asc())

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    docs = result.scalars().all()

    return DocumentList(
        documents=[DocumentOut.model_validate(d) for d in docs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    doc_type = FILE_TYPE_MAP.get(ext, "Otro")

    # Upload to storage
    file_path = await upload_file(DEMO_TENANT, file)

    # Create document record
    doc = Document(
        tenant_id=DEMO_TENANT,
        name=file.filename or "Sin nombre",
        type=doc_type,
        status="processing",
        file_path=file_path,
        file_size=file.size,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Trigger pipeline (stub - in production this would be async via a task queue)
    await process_document(db, doc.id)

    return DocumentUploadResponse(id=doc.id, name=doc.name)


@router.get("/{document_id}", response_model=DocumentDetail)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.tenant_id == DEMO_TENANT)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return DocumentDetail.model_validate(doc)


@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.tenant_id == DEMO_TENANT)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    await db.execute(delete(Document).where(Document.id == document_id))
    await db.commit()
    return {"message": "Documento eliminado"}


@router.delete("")
async def delete_documents_batch(
    ids: list[uuid.UUID],
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Document).where(Document.id.in_(ids), Document.tenant_id == DEMO_TENANT)
    )
    await db.commit()
    return {"message": f"{len(ids)} documentos eliminados"}
