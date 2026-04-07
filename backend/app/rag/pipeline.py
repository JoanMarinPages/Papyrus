"""
RAG Pipeline: orchestrates document processing from raw files to knowledge graph.
"""
from pathlib import Path
from .parser import parse_directory, ParsedDocument
from .extractor import extract_from_documents, Entity, Relationship
from .graph_store import get_graph_store, GraphStore
from .query_engine import QueryEngine


class RAGPipeline:
    """Main pipeline: ingest -> extract -> build graph -> query."""

    def __init__(self):
        self.graph = get_graph_store()
        self.documents: list[ParsedDocument] = []
        self.entities: list[Entity] = []
        self.relationships: list[Relationship] = []
        self._query_engine: QueryEngine | None = None
        self._ingested = False

    @property
    def is_ready(self) -> bool:
        return self._ingested

    def ingest(self, docs_path: str | Path) -> dict:
        """
        Full pipeline: parse docs -> extract entities -> build graph.
        Returns stats about what was processed.
        """
        path = Path(docs_path)

        # Step 1: Parse documents
        self.documents = parse_directory(path)
        if not self.documents:
            return {"status": "error", "message": f"No .md files found in {path}"}

        # Step 2: Extract entities and relationships
        self.entities, self.relationships = extract_from_documents(self.documents)

        # Step 3: Load into graph
        self.graph.load(self.entities, self.relationships)

        # Step 4: Initialize query engine
        self._query_engine = QueryEngine(self.graph, self.documents)
        self._ingested = True

        stats = self.graph.get_stats()
        return {
            "status": "success",
            "documents_processed": len(self.documents),
            "entities_extracted": len(self.entities),
            "relationships_extracted": len(self.relationships),
            "graph_stats": stats,
        }

    def query(self, question: str) -> dict:
        """Query the knowledge graph."""
        if not self._query_engine:
            return {"error": "Pipeline not initialized. Run ingest first."}

        result = self._query_engine.query(question)
        return {
            "answer": result.answer,
            "sources": result.sources,
            "confidence": result.confidence,
            "reasoning": result.reasoning,
        }

    def get_graph_data(self, entity_type: str | None = None, search: str = "", limit: int = 100) -> dict:
        """Get graph nodes and edges for visualization."""
        entities = self.graph.search_entities(
            query=search,
            entity_type=entity_type if entity_type and entity_type != "all" else None,
            limit=limit,
        )

        entity_ids = {e.id for e in entities}

        # Get edges between visible entities
        edges = [
            {"source": r.source_id, "target": r.target_id, "relation": r.relation}
            for r in self.graph.relationships
            if r.source_id in entity_ids and r.target_id in entity_ids
        ]

        nodes = [
            {
                "id": e.id,
                "label": e.label,
                "type": e.type,
                "connections": self.graph.get_connections_count(e.id),
                "properties": e.properties,
            }
            for e in entities
        ]

        return {"nodes": nodes, "edges": edges}

    def get_entity_detail(self, entity_id: str) -> dict | None:
        """Get full detail of an entity including neighbors."""
        entity = self.graph.get_entity(entity_id)
        if not entity:
            return None

        neighbors = self.graph.get_neighbors(entity_id)
        return {
            "id": entity.id,
            "label": entity.label,
            "type": entity.type,
            "properties": entity.properties,
            "neighbors": [
                {"id": n.id, "label": n.label, "type": n.type, "relation": rel}
                for n, rel in neighbors
            ],
        }


# Singleton
_pipeline = RAGPipeline()


def get_pipeline() -> RAGPipeline:
    return _pipeline
