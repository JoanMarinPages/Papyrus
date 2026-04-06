"""
Document processing pipeline (stub).

In production this will:
1. Parse uploaded files (PDF, DOCX, etc.) into text
2. Chunk text into semantic segments
3. Generate embeddings via Voyage API
4. Extract entities/relationships via LLM for GraphRAG
5. Store chunks + embeddings in pgvector
6. Store graph nodes + edges in graph tables
7. Update document status and counts

For now, it simulates the pipeline with a status update.
"""
import uuid

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document


async def process_document(db: AsyncSession, document_id: uuid.UUID) -> None:
    """
    Stub: marks a document as indexed with mock counts.
    TODO: Replace with real pipeline (LlamaIndex ingestion + LightRAG).
    """
    await db.execute(
        update(Document)
        .where(Document.id == document_id)
        .values(
            status="indexed",
            chunks_count=42,
            entities_count=15,
        )
    )
    await db.commit()
