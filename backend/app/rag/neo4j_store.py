"""
Neo4j knowledge graph store.
Persists entities and relationships in Neo4j Desktop.
Falls back to in-memory if Neo4j is unavailable.
"""
from neo4j import GraphDatabase, Driver
from neo4j.exceptions import ServiceUnavailable, AuthError

from app.config import get_settings
from .extractor import Entity, Relationship


class Neo4jStore:
    """Neo4j-backed graph store with automatic fallback to in-memory."""

    def __init__(self):
        self._driver: Driver | None = None
        self._connected = False

    def connect(self) -> bool:
        """Try to connect to Neo4j. Returns True if successful."""
        if self._connected and self._driver:
            return True

        settings = get_settings()
        try:
            self._driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
            )
            self._driver.verify_connectivity()
            self._connected = True
            self._ensure_indexes()
            return True
        except (ServiceUnavailable, AuthError, Exception) as e:
            print(f"[Neo4j] Connection failed: {e}. Using in-memory fallback.")
            self._connected = False
            return False

    def _ensure_indexes(self):
        """Create indexes for fast lookups."""
        with self._driver.session() as session:
            session.run("CREATE INDEX entity_id IF NOT EXISTS FOR (n:Entity) ON (n.entity_id)")
            session.run("CREATE INDEX entity_type IF NOT EXISTS FOR (n:Entity) ON (n.type)")

    @property
    def is_connected(self) -> bool:
        return self._connected

    def clear(self):
        """Delete all nodes and relationships."""
        if not self._connected:
            return
        with self._driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")

    def load(self, entities: list[Entity], relationships: list[Relationship]):
        """Load entities and relationships into Neo4j."""
        if not self._connected:
            return

        with self._driver.session() as session:
            # Clear existing data
            session.run("MATCH (n) DETACH DELETE n")

            # Create entities with their type as label
            for e in entities:
                label = _sanitize_label(e.type)
                props = {
                    "entity_id": e.id,
                    "label": e.label,
                    "type": e.type,
                    **{k: v for k, v in e.properties.items() if v},
                }
                session.run(
                    f"CREATE (n:Entity:{label} $props)",
                    props=props,
                )

            # Create relationships
            for r in relationships:
                rel_type = _sanitize_rel(r.relation)
                session.run(
                    f"""
                    MATCH (a:Entity {{entity_id: $source}})
                    MATCH (b:Entity {{entity_id: $target}})
                    CREATE (a)-[:{rel_type}]->(b)
                    """,
                    source=r.source_id,
                    target=r.target_id,
                )

    def get_entity(self, entity_id: str) -> dict | None:
        if not self._connected:
            return None
        with self._driver.session() as session:
            result = session.run(
                "MATCH (n:Entity {entity_id: $id}) RETURN n",
                id=entity_id,
            )
            record = result.single()
            if not record:
                return None
            node = record["n"]
            return dict(node)

    def get_neighbors(self, entity_id: str) -> list[dict]:
        if not self._connected:
            return []
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (n:Entity {entity_id: $id})-[r]-(m:Entity)
                RETURN m.entity_id AS id, m.label AS label, m.type AS type, type(r) AS relation
                """,
                id=entity_id,
            )
            return [dict(record) for record in result]

    def get_connections_count(self, entity_id: str) -> int:
        if not self._connected:
            return 0
        with self._driver.session() as session:
            result = session.run(
                "MATCH (n:Entity {entity_id: $id})-[r]-() RETURN count(r) AS cnt",
                id=entity_id,
            )
            record = result.single()
            return record["cnt"] if record else 0

    def search_entities(
        self,
        query: str = "",
        entity_type: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        if not self._connected:
            return []

        conditions = []
        params: dict = {"limit": limit}

        if entity_type:
            conditions.append("n.type = $type")
            params["type"] = entity_type
        if query:
            conditions.append("toLower(n.label) CONTAINS toLower($query)")
            params["query"] = query

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        with self._driver.session() as session:
            result = session.run(
                f"""
                MATCH (n:Entity) {where}
                OPTIONAL MATCH (n)-[r]-()
                RETURN n.entity_id AS id, n.label AS label, n.type AS type,
                       count(r) AS connections, properties(n) AS props
                ORDER BY connections DESC
                LIMIT $limit
                """,
                **params,
            )
            return [
                {
                    "id": r["id"],
                    "label": r["label"],
                    "type": r["type"],
                    "connections": r["connections"],
                    "properties": {k: v for k, v in r["props"].items() if k not in ("entity_id", "label", "type")},
                }
                for r in result
            ]

    def get_all_relationships(self) -> list[dict]:
        if not self._connected:
            return []
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (a:Entity)-[r]->(b:Entity)
                RETURN a.entity_id AS source, b.entity_id AS target, type(r) AS relation
                """
            )
            return [dict(r) for r in result]

    def get_stats(self) -> dict:
        if not self._connected:
            return {"total_nodes": 0, "total_edges": 0, "types": {}}
        with self._driver.session() as session:
            nodes = session.run("MATCH (n:Entity) RETURN n.type AS type, count(n) AS cnt").data()
            edges = session.run("MATCH ()-[r]->() RETURN count(r) AS cnt").single()

            types = {r["type"]: r["cnt"] for r in nodes}
            return {
                "total_nodes": sum(types.values()),
                "total_edges": edges["cnt"] if edges else 0,
                "types": types,
            }

    def get_subgraph(self, entity_id: str, depth: int = 2) -> dict:
        if not self._connected:
            return {"nodes": [], "edges": []}
        with self._driver.session() as session:
            result = session.run(
                f"""
                MATCH path = (n:Entity {{entity_id: $id}})-[*1..{depth}]-(m:Entity)
                UNWIND nodes(path) AS node
                WITH DISTINCT node
                OPTIONAL MATCH (node)-[r]-()
                RETURN node.entity_id AS id, node.label AS label, node.type AS type,
                       count(r) AS connections
                """,
                id=entity_id,
            )
            nodes = [dict(r) for r in result]

            node_ids = {n["id"] for n in nodes}
            result2 = session.run(
                """
                MATCH (a:Entity)-[r]->(b:Entity)
                WHERE a.entity_id IN $ids AND b.entity_id IN $ids
                RETURN a.entity_id AS source, b.entity_id AS target, type(r) AS relation
                """,
                ids=list(node_ids),
            )
            edges = [dict(r) for r in result2]

            return {"nodes": nodes, "edges": edges}

    def query_path(self, from_id: str, to_id: str, max_depth: int = 5) -> list[list[str]] | None:
        if not self._connected:
            return None
        with self._driver.session() as session:
            result = session.run(
                f"""
                MATCH path = shortestPath(
                    (a:Entity {{entity_id: $from}})-[*..{max_depth}]-(b:Entity {{entity_id: $to}})
                )
                RETURN [n IN nodes(path) | n.entity_id] AS path
                """,
                **{"from": from_id, "to": to_id},
            )
            paths = [r["path"] for r in result]
            return paths if paths else None

    def close(self):
        if self._driver:
            self._driver.close()
            self._connected = False


def _sanitize_label(s: str) -> str:
    """Ensure label is a valid Neo4j node label."""
    return "".join(c if c.isalnum() else "_" for c in s.capitalize())


def _sanitize_rel(s: str) -> str:
    """Ensure relationship type is a valid Neo4j relationship type."""
    return "".join(c if c.isalnum() or c == "_" else "_" for c in s.upper())


# Singleton
_neo4j_store = Neo4jStore()


def get_neo4j_store() -> Neo4jStore:
    return _neo4j_store
