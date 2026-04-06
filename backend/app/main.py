from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import documents, dashboard, templates, graph, api_keys, analytics, settings

app = FastAPI(
    title="Papyrus API",
    description="Plataforma SaaS de generación inteligente de documentos con Hybrid RAG (GraphRAG + VectorRAG)",
    version="0.1.0",
)

# CORS
config = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(documents.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(api_keys.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Papyrus API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
