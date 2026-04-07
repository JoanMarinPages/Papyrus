"""
RAG Query Engine: combines graph traversal + text search to answer questions.
Works locally without any LLM - uses the knowledge graph for reasoning.
"""
import re
from dataclasses import dataclass
from .graph_store import GraphStore, get_graph_store
from .parser import ParsedDocument


@dataclass
class QueryResult:
    answer: str
    sources: list[dict]  # [{entity_id, label, type, relation}]
    confidence: float
    reasoning: list[str]  # Steps taken to find the answer


class QueryEngine:
    def __init__(self, graph: GraphStore, documents: list[ParsedDocument]):
        self.graph = graph
        self.documents = {d.filename: d for d in documents}

    def query(self, question: str) -> QueryResult:
        """Answer a question using the knowledge graph."""
        q = question.lower().strip()

        # Try different query strategies
        result = (
            self._query_person(q)
            or self._query_policy(q)
            or self._query_coverage(q)
            or self._query_stats(q)
            or self._query_general(q)
        )

        return result or QueryResult(
            answer="No he encontrado informacion relevante para esa consulta en el grafo de conocimiento.",
            sources=[],
            confidence=0.0,
            reasoning=["Busqueda en grafo sin resultados"],
        )

    def _query_person(self, q: str) -> QueryResult | None:
        """Handle queries about people/clients."""
        # Find person entities mentioned in the query
        persons = self.graph.search_entities(entity_type="person")
        matched_person = None
        for p in persons:
            name_parts = p.label.lower().split()
            if any(part in q for part in name_parts if len(part) > 3):
                matched_person = p
                break

        if not matched_person:
            return None

        neighbors = self.graph.get_neighbors(matched_person.id)
        policies = [(e, r) for e, r in neighbors if e.type == "policy"]
        orgs = [(e, r) for e, r in neighbors if e.type == "organization"]

        lines = [f"**{matched_person.label}**"]
        if matched_person.properties.get("dni"):
            lines.append(f"- DNI: {matched_person.properties['dni']}")

        if policies:
            lines.append(f"\n**Polizas ({len(policies)}):**")
            total_premium = 0.0
            for policy, rel in policies:
                premium_str = policy.properties.get("premium", "")
                premium = _parse_amount(premium_str)
                total_premium += premium
                lines.append(
                    f"- {policy.label} | Prima: {premium_str} | "
                    f"Vigencia: {policy.properties.get('effect_date', '?')} - {policy.properties.get('expiry_date', '?')}"
                )
            lines.append(f"\n**Total primas anuales: {total_premium:,.2f} EUR**")

        sources = [{"entity_id": matched_person.id, "label": matched_person.label, "type": "person", "relation": "query_subject"}]
        sources.extend({"entity_id": e.id, "label": e.label, "type": e.type, "relation": r} for e, r in policies)

        return QueryResult(
            answer="\n".join(lines),
            sources=sources,
            confidence=0.9,
            reasoning=[
                f"Encontrado cliente: {matched_person.label}",
                f"Traversal del grafo: {len(neighbors)} conexiones",
                f"Polizas encontradas: {len(policies)}",
            ],
        )

    def _query_policy(self, q: str) -> QueryResult | None:
        """Handle queries about specific policies."""
        # Search by policy number pattern
        pol_match = re.search(r"([A-Z]{3}-[A-Z]{3}-\d{4}-\d+)", q.upper())
        if pol_match:
            pol_num = pol_match.group(1)
            policies = self.graph.search_entities(query=pol_num, entity_type="policy")
            if policies:
                return self._describe_policy(policies[0])

        # Search by policy type keywords
        type_map = {"hogar": "hogar", "auto": "auto", "vida": "vida", "salud": "salud", "comercio": "comercio", "coche": "auto", "casa": "hogar"}
        for keyword, subtype in type_map.items():
            if keyword in q:
                policies = [
                    e for e in self.graph.search_entities(entity_type="policy")
                    if e.properties.get("subtype") == subtype
                ]
                if policies:
                    lines = [f"**Polizas de {subtype.capitalize()} ({len(policies)}):**\n"]
                    for p in policies:
                        lines.append(f"- {p.label} | Prima: {p.properties.get('premium', '?')}")
                    return QueryResult(
                        answer="\n".join(lines),
                        sources=[{"entity_id": p.id, "label": p.label, "type": "policy", "relation": "match"} for p in policies],
                        confidence=0.8,
                        reasoning=[f"Busqueda por tipo de poliza: {subtype}", f"Encontradas: {len(policies)}"],
                    )
        return None

    def _describe_policy(self, policy) -> QueryResult:
        neighbors = self.graph.get_neighbors(policy.id)
        persons = [(e, r) for e, r in neighbors if e.type == "person"]
        coverages = [(e, r) for e, r in neighbors if e.type == "coverage"]
        locations = [(e, r) for e, r in neighbors if e.type == "location"]
        vehicles = [(e, r) for e, r in neighbors if e.type == "vehicle"]

        lines = [f"**{policy.label}**\n"]
        lines.append(f"- Prima: {policy.properties.get('premium', '?')}")
        lines.append(f"- Pago: {policy.properties.get('payment', '?')}")
        lines.append(f"- Vigencia: {policy.properties.get('effect_date', '?')} - {policy.properties.get('expiry_date', '?')}")

        if persons:
            lines.append(f"\n**Tomador:** {persons[0][0].label}")
        if locations:
            lines.append(f"**Ubicacion:** {locations[0][0].label}")
        if vehicles:
            lines.append(f"**Vehiculo:** {vehicles[0][0].label} ({vehicles[0][0].properties.get('matricula', '')})")
        if coverages:
            lines.append(f"\n**Coberturas ({len(coverages)}):**")
            for c, _ in coverages:
                lines.append(f"- {c.label}: {c.properties.get('value', '')}")

        sources = [{"entity_id": policy.id, "label": policy.label, "type": "policy", "relation": "described"}]
        return QueryResult(
            answer="\n".join(lines),
            sources=sources,
            confidence=0.95,
            reasoning=[f"Poliza encontrada: {policy.label}", f"Coberturas: {len(coverages)}", f"Conexiones: {len(neighbors)}"],
        )

    def _query_coverage(self, q: str) -> QueryResult | None:
        """Handle queries about coverages."""
        coverage_keywords = ["cobertura", "cubre", "incluye", "capital", "asegurado"]
        if not any(k in q for k in coverage_keywords):
            return None

        coverages = self.graph.search_entities(entity_type="coverage", limit=50)
        if not coverages:
            return None

        # Group by type
        by_name: dict[str, list] = {}
        for c in coverages:
            name = c.label
            by_name.setdefault(name, []).append(c)

        lines = [f"**Coberturas en el sistema ({len(coverages)} total):**\n"]
        for name, items in sorted(by_name.items()):
            values = [i.properties.get("value", "") for i in items]
            lines.append(f"- **{name}**: {', '.join(set(values))}")

        return QueryResult(
            answer="\n".join(lines),
            sources=[{"entity_id": c.id, "label": c.label, "type": "coverage", "relation": "listed"} for c in coverages[:10]],
            confidence=0.7,
            reasoning=[f"Coberturas encontradas: {len(coverages)}", f"Tipos unicos: {len(by_name)}"],
        )

    def _query_stats(self, q: str) -> QueryResult | None:
        """Handle statistical queries."""
        stat_keywords = ["cuantos", "cuantas", "total", "resumen", "estadistica", "numero de"]
        if not any(k in q for k in stat_keywords):
            return None

        stats = self.graph.get_stats()
        lines = ["**Estadisticas del grafo de conocimiento:**\n"]
        lines.append(f"- Total nodos: {stats['total_nodes']}")
        lines.append(f"- Total relaciones: {stats['total_edges']}")
        lines.append("\n**Por tipo:**")
        for t, count in sorted(stats["types"].items()):
            lines.append(f"- {t.capitalize()}: {count}")

        return QueryResult(
            answer="\n".join(lines),
            sources=[],
            confidence=0.85,
            reasoning=["Consulta de estadisticas del grafo"],
        )

    def _query_general(self, q: str) -> QueryResult | None:
        """Fallback: search all entities matching query terms."""
        words = [w for w in q.split() if len(w) > 3]
        if not words:
            return None

        matches = []
        for word in words:
            matches.extend(self.graph.search_entities(query=word, limit=5))

        # Deduplicate
        seen = set()
        unique = []
        for m in matches:
            if m.id not in seen:
                seen.add(m.id)
                unique.append(m)

        if not unique:
            return None

        lines = [f"**Resultados para '{' '.join(words)}':**\n"]
        for e in unique[:10]:
            neighbors = self.graph.get_neighbors(e.id)
            connections = f" ({len(neighbors)} conexiones)" if neighbors else ""
            lines.append(f"- [{e.type}] **{e.label}**{connections}")

        return QueryResult(
            answer="\n".join(lines),
            sources=[{"entity_id": e.id, "label": e.label, "type": e.type, "relation": "search_match"} for e in unique[:10]],
            confidence=0.5,
            reasoning=[f"Busqueda general: {len(unique)} resultados"],
        )


def _parse_amount(s: str) -> float:
    """Parse a Spanish-formatted amount like '487,35 EUR'."""
    cleaned = re.sub(r"[^\d,.]", "", s).replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0
