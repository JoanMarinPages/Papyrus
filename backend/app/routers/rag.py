"""RAG API endpoints: ingest documents, query graph, visualize."""
from pathlib import Path

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.rag.pipeline import get_pipeline

router = APIRouter(prefix="/rag", tags=["RAG Pipeline"])

# Default sample docs path (relative to backend/)
SAMPLE_DOCS = Path(__file__).resolve().parent.parent.parent.parent / "sample-docs" / "axa"


class IngestRequest(BaseModel):
    path: str | None = None  # Override docs path, defaults to sample-docs/axa


class QueryRequest(BaseModel):
    question: str


@router.post("/ingest")
async def ingest_documents(req: IngestRequest | None = None):
    """Process documents and build knowledge graph."""
    docs_path = Path(req.path) if req and req.path else SAMPLE_DOCS
    pipeline = get_pipeline()
    result = pipeline.ingest(docs_path)
    return result


@router.post("/query")
async def query_graph(req: QueryRequest):
    """Query the knowledge graph with a natural language question."""
    pipeline = get_pipeline()
    if not pipeline.is_ready:
        # Auto-ingest sample docs on first query
        pipeline.ingest(SAMPLE_DOCS)
    return pipeline.query(req.question)


@router.get("/graph")
async def get_graph(
    type: str | None = Query(None),
    search: str = Query(""),
    limit: int = Query(100, ge=1, le=500),
):
    """Get graph nodes and edges for visualization."""
    pipeline = get_pipeline()
    if not pipeline.is_ready:
        pipeline.ingest(SAMPLE_DOCS)
    return pipeline.get_graph_data(entity_type=type, search=search, limit=limit)


@router.get("/graph/{entity_id}")
async def get_entity(entity_id: str):
    """Get full detail of an entity including its neighbors."""
    pipeline = get_pipeline()
    if not pipeline.is_ready:
        pipeline.ingest(SAMPLE_DOCS)
    detail = pipeline.get_entity_detail(entity_id)
    if not detail:
        return {"error": "Entity not found"}
    return detail


@router.get("/stats")
async def get_stats():
    """Get pipeline and graph statistics."""
    pipeline = get_pipeline()
    if not pipeline.is_ready:
        return {"status": "not_initialized", "message": "Call POST /api/rag/ingest first"}
    stats = pipeline.graph.get_stats()
    return {
        "status": "ready",
        "documents": len(pipeline.documents),
        "entities": len(pipeline.entities),
        "relationships": len(pipeline.relationships),
        "graph": stats,
    }
