"""
In-memory knowledge graph store.
Holds entities and relationships, supports traversal queries.
"""
from dataclasses import dataclass, field
from .extractor import Entity, Relationship


@dataclass
class GraphStore:
    """In-memory graph database."""
    entities: dict[str, Entity] = field(default_factory=dict)
    relationships: list[Relationship] = field(default_factory=list)
    _adjacency: dict[str, list[tuple[str, str]]] = field(default_factory=dict)  # id -> [(target_id, relation)]

    def load(self, entities: list[Entity], relationships: list[Relationship]):
        """Load entities and relationships into the graph."""
        self.entities = {e.id: e for e in entities}
        self.relationships = relationships
        self._build_adjacency()

    def _build_adjacency(self):
        self._adjacency.clear()
        for r in self.relationships:
            self._adjacency.setdefault(r.source_id, []).append((r.target_id, r.relation))
            self._adjacency.setdefault(r.target_id, []).append((r.source_id, r.relation))

    def get_entity(self, entity_id: str) -> Entity | None:
        return self.entities.get(entity_id)

    def get_neighbors(self, entity_id: str) -> list[tuple[Entity, str]]:
        """Get all neighbors of an entity with their relationship type."""
        result = []
        for target_id, relation in self._adjacency.get(entity_id, []):
            entity = self.entities.get(target_id)
            if entity:
                result.append((entity, relation))
        return result

    def get_connections_count(self, entity_id: str) -> int:
        return len(self._adjacency.get(entity_id, []))

    def search_entities(
        self,
        query: str = "",
        entity_type: str | None = None,
        limit: int = 100,
    ) -> list[Entity]:
        """Search entities by label and/or type."""
        results = []
        query_lower = query.lower()
        for entity in self.entities.values():
            if entity_type and entity.type != entity_type:
                continue
            if query_lower and query_lower not in entity.label.lower():
                continue
            results.append(entity)
            if len(results) >= limit:
                break
        return results

    def get_stats(self) -> dict:
        """Get graph statistics."""
        type_counts: dict[str, int] = {}
        for e in self.entities.values():
            type_counts[e.type] = type_counts.get(e.type, 0) + 1
        return {
            "total_nodes": len(self.entities),
            "total_edges": len(self.relationships),
            "types": type_counts,
        }

    def get_subgraph(self, entity_id: str, depth: int = 2) -> tuple[list[Entity], list[Relationship]]:
        """Get a subgraph around an entity up to a given depth."""
        visited: set[str] = set()
        queue = [(entity_id, 0)]
        sub_entities: list[Entity] = []
        sub_rels: list[Relationship] = []

        while queue:
            current_id, current_depth = queue.pop(0)
            if current_id in visited or current_depth > depth:
                continue
            visited.add(current_id)

            entity = self.entities.get(current_id)
            if entity:
                sub_entities.append(entity)

            if current_depth < depth:
                for target_id, _ in self._adjacency.get(current_id, []):
                    if target_id not in visited:
                        queue.append((target_id, current_depth + 1))

        # Collect relationships within visited nodes
        for r in self.relationships:
            if r.source_id in visited and r.target_id in visited:
                sub_rels.append(r)

        return sub_entities, sub_rels

    def query_path(self, from_id: str, to_id: str, max_depth: int = 5) -> list[list[str]] | None:
        """Find paths between two entities using BFS."""
        if from_id not in self.entities or to_id not in self.entities:
            return None

        queue: list[list[str]] = [[from_id]]
        visited: set[str] = {from_id}
        paths: list[list[str]] = []

        while queue:
            path = queue.pop(0)
            current = path[-1]

            if current == to_id:
                paths.append(path)
                continue

            if len(path) > max_depth:
                continue

            for neighbor_id, _ in self._adjacency.get(current, []):
                if neighbor_id not in visited:
                    visited.add(neighbor_id)
                    queue.append(path + [neighbor_id])

        return paths if paths else None


# Singleton instance
_graph_store = GraphStore()


def get_graph_store() -> GraphStore:
    return _graph_store
