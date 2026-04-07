"""
RAG Pipeline: orchestrates document processing from raw files to knowledge graph.
Uses Neo4j when available, falls back to in-memory graph store.
"""
from pathlib import Path
from .parser import parse_directory, ParsedDocument
from .extractor import extract_from_documents, Entity, Relationship
from .graph_store import get_graph_store, GraphStore
from .neo4j_store import get_neo4j_store, Neo4jStore
from .query_engine import QueryEngine


class RAGPipeline:
    """Main pipeline: ingest -> extract -> build graph -> query."""

    def __init__(self):
        self._memory_graph = get_graph_store()
        self._neo4j = get_neo4j_store()
        self.documents: list[ParsedDocument] = []
        self.entities: list[Entity] = []
        self.relationships: list[Relationship] = []
        self._query_engine: QueryEngine | None = None
        self._ingested = False
        self._storage: str = "memory"  # "neo4j" or "memory"

    @property
    def graph(self) -> GraphStore:
        return self._memory_graph

    @property
    def is_ready(self) -> bool:
        return self._ingested

    @property
    def storage_backend(self) -> str:
        return self._storage

    def ingest(self, docs_path: str | Path) -> dict:
        """
        Full pipeline: parse docs -> extract entities -> build graph.
        Tries Neo4j first, falls back to in-memory.
        """
        path = Path(docs_path)

        # Step 1: Parse documents
        self.documents = parse_directory(path)
        if not self.documents:
            return {"status": "error", "message": f"No .md files found in {path}"}

        # Step 2: Extract entities and relationships
        self.entities, self.relationships = extract_from_documents(self.documents)

        # Step 3: Try Neo4j, fallback to memory
        if self._neo4j.connect():
            self._neo4j.load(self.entities, self.relationships)
            self._storage = "neo4j"
            print(f"[Pipeline] Loaded {len(self.entities)} entities into Neo4j")
        else:
            self._storage = "memory"
            print(f"[Pipeline] Neo4j unavailable, using in-memory graph")

        # Always load in-memory too (for query engine which uses GraphStore)
        self._memory_graph.load(self.entities, self.relationships)

        # Step 4: Initialize query engine (uses in-memory for now)
        self._query_engine = QueryEngine(self._memory_graph, self.documents)
        self._ingested = True

        stats = self._get_stats()
        return {
            "status": "success",
            "storage": self._storage,
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
        # Use Neo4j if available for real-time data
        if self._storage == "neo4j" and self._neo4j.is_connected:
            nodes = self._neo4j.search_entities(
                query=search,
                entity_type=entity_type if entity_type and entity_type != "all" else None,
                limit=limit,
            )
            node_ids = {n["id"] for n in nodes}

            all_rels = self._neo4j.get_all_relationships()
            edges = [r for r in all_rels if r["source"] in node_ids and r["target"] in node_ids]

            return {"nodes": nodes, "edges": edges, "storage": "neo4j"}

        # Fallback to in-memory
        entities = self._memory_graph.search_entities(
            query=search,
            entity_type=entity_type if entity_type and entity_type != "all" else None,
            limit=limit,
        )
        entity_ids = {e.id for e in entities}

        edges = [
            {"source": r.source_id, "target": r.target_id, "relation": r.relation}
            for r in self._memory_graph.relationships
            if r.source_id in entity_ids and r.target_id in entity_ids
        ]

        nodes = [
            {
                "id": e.id,
                "label": e.label,
                "type": e.type,
                "connections": self._memory_graph.get_connections_count(e.id),
                "properties": e.properties,
            }
            for e in entities
        ]

        return {"nodes": nodes, "edges": edges, "storage": "memory"}

    def get_entity_detail(self, entity_id: str) -> dict | None:
        """Get full detail of an entity including neighbors."""
        if self._storage == "neo4j" and self._neo4j.is_connected:
            entity = self._neo4j.get_entity(entity_id)
            if not entity:
                return None
            neighbors = self._neo4j.get_neighbors(entity_id)
            return {
                "id": entity.get("entity_id", entity_id),
                "label": entity.get("label", ""),
                "type": entity.get("type", ""),
                "properties": {k: v for k, v in entity.items() if k not in ("entity_id", "label", "type")},
                "neighbors": neighbors,
                "storage": "neo4j",
            }

        # Fallback
        entity = self._memory_graph.get_entity(entity_id)
        if not entity:
            return None
        neighbors = self._memory_graph.get_neighbors(entity_id)
        return {
            "id": entity.id,
            "label": entity.label,
            "type": entity.type,
            "properties": entity.properties,
            "neighbors": [
                {"id": n.id, "label": n.label, "type": n.type, "relation": rel}
                for n, rel in neighbors
            ],
            "storage": "memory",
        }

    def _get_stats(self) -> dict:
        if self._storage == "neo4j" and self._neo4j.is_connected:
            return self._neo4j.get_stats()
        return self._memory_graph.get_stats()


# Singleton
_pipeline = RAGPipeline()


def get_pipeline() -> RAGPipeline:
    return _pipeline
