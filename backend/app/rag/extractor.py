"""
Entity and relationship extractor.
Extracts structured entities from parsed AXA documents without needing an LLM.
Uses pattern matching on the known document structure.
"""
import re
from dataclasses import dataclass
from .parser import ParsedDocument


@dataclass
class Entity:
    id: str
    label: str
    type: str  # person, organization, policy, location, vehicle, coverage, product
    properties: dict[str, str]


@dataclass
class Relationship:
    source_id: str
    target_id: str
    relation: str
    properties: dict[str, str]


def _make_id(entity_type: str, label: str) -> str:
    """Create a stable ID from type + label."""
    slug = re.sub(r"[^a-z0-9]+", "-", label.lower().strip()).strip("-")
    return f"{entity_type}:{slug}"


def extract_entities(doc: ParsedDocument) -> tuple[list[Entity], list[Relationship]]:
    """Extract entities and relationships from a parsed document."""
    entities: dict[str, Entity] = {}
    relationships: list[Relationship] = []

    # Always create AXA org node
    axa_id = _make_id("org", "AXA Seguros")
    entities[axa_id] = Entity(
        id=axa_id, label="AXA Seguros", type="organization",
        properties={"sector": "Seguros", "pais": "Espana"},
    )

    # Document node
    doc_id = _make_id("document", doc.filename)
    entities[doc_id] = Entity(
        id=doc_id, label=doc.title, type="document",
        properties={"type": doc.doc_type, "filename": doc.filename},
    )
    relationships.append(Relationship(axa_id, doc_id, "emite", {}))

    if doc.doc_type == "poliza":
        _extract_policy(doc, entities, relationships, axa_id, doc_id)
    elif doc.doc_type == "resumen":
        _extract_summary(doc, entities, relationships, axa_id, doc_id)
    elif doc.doc_type == "publicidad":
        _extract_promo(doc, entities, relationships, axa_id, doc_id)

    return list(entities.values()), relationships


def _extract_policy(
    doc: ParsedDocument,
    entities: dict[str, Entity],
    relationships: list[Relationship],
    axa_id: str,
    doc_id: str,
):
    meta = doc.metadata

    # Person (tomador)
    person_name = meta.get("Tomador") or meta.get("Tomador/Asegurado", "")
    if person_name:
        person_id = _make_id("person", person_name)
        if person_id not in entities:
            entities[person_id] = Entity(
                id=person_id, label=person_name, type="person",
                properties={
                    "dni": meta.get("DNI", ""),
                    "email": "",
                },
            )
        relationships.append(Relationship(person_id, doc_id, "es_tomador_de", {}))
        relationships.append(Relationship(person_id, axa_id, "es_cliente_de", {}))

    # Policy
    policy_num = meta.get("Numero de poliza", "")
    ref = meta.get("Ref", "") or doc.filename
    if policy_num:
        policy_id = _make_id("policy", policy_num)
        # Determine policy subtype from filename
        subtype = "general"
        for t in ["hogar", "auto", "vida", "salud", "comercio"]:
            if t in doc.filename.lower():
                subtype = t
                break

        entities[policy_id] = Entity(
            id=policy_id, label=f"Poliza {subtype.capitalize()} {policy_num}",
            type="policy",
            properties={
                "number": policy_num,
                "ref": ref,
                "subtype": subtype,
                "premium": meta.get("Prima anual", ""),
                "payment": meta.get("Forma de pago", ""),
                "effect_date": meta.get("Fecha de efecto", ""),
                "expiry_date": meta.get("Fecha de vencimiento", ""),
            },
        )
        relationships.append(Relationship(axa_id, policy_id, "provee", {}))
        relationships.append(Relationship(doc_id, policy_id, "describe", {}))
        if person_name:
            person_id = _make_id("person", person_name)
            relationships.append(Relationship(person_id, policy_id, "contrata", {}))

    # Location
    address = meta.get("Direccion asegurada", "") or meta.get("Direccion", "")
    if address:
        loc_id = _make_id("location", address)
        entities[loc_id] = Entity(
            id=loc_id, label=address, type="location",
            properties={"full_address": address},
        )
        if policy_num:
            relationships.append(Relationship(_make_id("policy", policy_num), loc_id, "cubre_ubicacion", {}))

    # Vehicle
    vehicle = meta.get("Vehiculo", "")
    if vehicle:
        veh_id = _make_id("vehicle", vehicle)
        entities[veh_id] = Entity(
            id=veh_id, label=vehicle, type="vehicle",
            properties={"matricula": meta.get("Matricula", "")},
        )
        if policy_num:
            relationships.append(Relationship(_make_id("policy", policy_num), veh_id, "cubre_vehiculo", {}))

    # Coverages from tables
    for table in doc.tables:
        for row in table:
            cov_name = row.get("Cobertura", "") or row.get("Concepto", "")
            cov_value = row.get("Capital asegurado", "") or row.get("Capital", "") or row.get("Detalle", "") or row.get("Valor", "")
            if cov_name and cov_value:
                cov_id = _make_id("coverage", f"{cov_name}-{policy_num}")
                entities[cov_id] = Entity(
                    id=cov_id, label=cov_name, type="coverage",
                    properties={"value": cov_value, "policy": policy_num},
                )
                if policy_num:
                    relationships.append(Relationship(_make_id("policy", policy_num), cov_id, "incluye", {}))

    # Beneficiaries
    beneficiarios = meta.get("Beneficiarios", "") or meta.get("Beneficiario", "")
    if beneficiarios and "Herederos" not in beneficiarios:
        # Parse named beneficiaries
        for part in beneficiarios.split(","):
            name_match = re.search(r"([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", part)
            if name_match:
                ben_name = name_match.group(1).strip()
                ben_id = _make_id("person", ben_name)
                if ben_id not in entities:
                    entities[ben_id] = Entity(id=ben_id, label=ben_name, type="person", properties={})
                if policy_num:
                    relationships.append(Relationship(ben_id, _make_id("policy", policy_num), "es_beneficiario_de", {}))


def _extract_summary(
    doc: ParsedDocument,
    entities: dict[str, Entity],
    relationships: list[Relationship],
    axa_id: str,
    doc_id: str,
):
    meta = doc.metadata
    client_name = meta.get("Cliente", "") or meta.get("Agente", "")

    # Try to get from title line
    if not client_name:
        match = re.search(r"Cliente:\s*(.+?)$", doc.raw_text, re.MULTILINE)
        if match:
            client_name = match.group(1).strip()

    if client_name:
        person_id = _make_id("person", client_name)
        if person_id not in entities:
            entities[person_id] = Entity(id=person_id, label=client_name, type="person", properties={})
        relationships.append(Relationship(doc_id, person_id, "resumen_de", {}))
        relationships.append(Relationship(person_id, axa_id, "es_cliente_de", {}))

    # Extract referenced policies from tables
    for table in doc.tables:
        for row in table:
            pol_num = row.get("Poliza", "")
            pol_type = row.get("Tipo", "")
            if pol_num:
                pol_id = _make_id("policy", pol_num)
                if pol_id not in entities:
                    entities[pol_id] = Entity(
                        id=pol_id, label=f"Poliza {pol_type} {pol_num}",
                        type="policy",
                        properties={"number": pol_num, "subtype": pol_type.lower()},
                    )
                relationships.append(Relationship(doc_id, pol_id, "referencia", {}))


def _extract_promo(
    doc: ParsedDocument,
    entities: dict[str, Entity],
    relationships: list[Relationship],
    axa_id: str,
    doc_id: str,
):
    # Product
    product_id = _make_id("product", doc.title)
    entities[product_id] = Entity(
        id=product_id, label=doc.title, type="product",
        properties={"doc_type": "publicidad"},
    )
    relationships.append(Relationship(axa_id, product_id, "ofrece", {}))
    relationships.append(Relationship(doc_id, product_id, "promociona", {}))


def extract_from_documents(docs: list[ParsedDocument]) -> tuple[list[Entity], list[Relationship]]:
    """Extract and merge entities from multiple documents."""
    all_entities: dict[str, Entity] = {}
    all_relationships: list[Relationship] = []

    for doc in docs:
        entities, rels = extract_entities(doc)
        for e in entities:
            if e.id in all_entities:
                # Merge properties
                all_entities[e.id].properties.update(
                    {k: v for k, v in e.properties.items() if v}
                )
            else:
                all_entities[e.id] = e
        all_relationships.extend(rels)

    # Deduplicate relationships
    seen = set()
    unique_rels = []
    for r in all_relationships:
        key = (r.source_id, r.target_id, r.relation)
        if key not in seen:
            seen.add(key)
            unique_rels.append(r)

    return list(all_entities.values()), unique_rels
