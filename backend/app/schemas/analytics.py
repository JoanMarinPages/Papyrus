from pydantic import BaseModel


class DashboardStats(BaseModel):
    documents_indexed: int
    graph_nodes: int
    docs_generated: int
    rag_accuracy: float


class RecentDocument(BaseModel):
    id: str
    name: str
    status: str
    type: str
    sources: int
    created_at: str


class TimeSeriesPoint(BaseModel):
    date: str
    processed: int
    generated: int


class DocumentTypeCount(BaseModel):
    type: str
    count: int


class AnalyticsOverview(BaseModel):
    time_series: list[TimeSeriesPoint]
    document_types: list[DocumentTypeCount]
    avg_latency_ms: float
    avg_accuracy: float


class RagSettingsOut(BaseModel):
    chunk_size: int
    chunk_overlap: float
    embedding_model: str
    semantic_chunking: bool
    top_k: int
    vector_weight: float
    reranking: bool
    crag: bool
    llm_model: str
    temperature: float
    max_tokens: int
    auto_citation: bool

    model_config = {"from_attributes": True}


class RagSettingsUpdate(BaseModel):
    chunk_size: int | None = None
    chunk_overlap: float | None = None
    embedding_model: str | None = None
    semantic_chunking: bool | None = None
    top_k: int | None = None
    vector_weight: float | None = None
    reranking: bool | None = None
    crag: bool | None = None
    llm_model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    auto_citation: bool | None = None
