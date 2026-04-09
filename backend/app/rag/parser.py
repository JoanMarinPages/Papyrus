"""
Document parser: reads files and extracts structured content.
Supports: .md, .txt, .csv, .xlsx (future: .pdf, .docx)

Classification levels:
  Level 1: Manual metadata tag (user provides type on upload)
  Level 2: Filename pattern matching
  Level 3: Content-based auto-detection (keyword analysis)
"""
import re
import csv
import io
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class ParsedDocument:
    filename: str
    title: str
    doc_type: str  # poliza, resumen, publicidad, siniestro, contrato, factura, otro
    doc_type_confidence: float  # 0.0 - 1.0
    classification_method: str  # "manual", "filename", "content"
    raw_text: str
    sections: dict[str, str] = field(default_factory=dict)
    tables: list[list[dict[str, str]]] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)
    manual_tags: dict[str, str] = field(default_factory=dict)  # Level 1: user-provided tags


# --- Level 3: Content-based classification rules ---
CONTENT_PATTERNS: dict[str, list[tuple[str, float]]] = {
    "poliza": [
        (r"p[oó]liza\s+de\s+seguro", 0.9),
        (r"coberturas?\s+contratadas?", 0.8),
        (r"prima\s+anual", 0.7),
        (r"tomador|asegurado", 0.7),
        (r"franquicia", 0.6),
        (r"fecha\s+de\s+efecto", 0.7),
        (r"vencimiento", 0.5),
        (r"n[uú]mero\s+de\s+p[oó]liza", 0.9),
        (r"capital\s+asegurado", 0.8),
        (r"responsabilidad\s+civil", 0.5),
    ],
    "siniestro": [
        (r"siniestro", 0.9),
        (r"peritaje|perito", 0.8),
        (r"indemnizaci[oó]n", 0.7),
        (r"declaraci[oó]n\s+de\s+siniestro", 0.95),
        (r"da[nñ]os", 0.4),
        (r"reclamaci[oó]n", 0.6),
        (r"parte\s+de\s+accidente", 0.8),
    ],
    "resumen": [
        (r"resumen\s+anual", 0.9),
        (r"resumen\s+de\s+seguros", 0.85),
        (r"periodo|per[ií]odo", 0.4),
        (r"total\s+primas", 0.7),
        (r"recomendaciones?\s+personalizadas?", 0.8),
        (r"ahorro\s+por\s+fidelidad", 0.7),
        (r"p[oó]lizas\s+activas", 0.6),
    ],
    "publicidad": [
        (r"promoci[oó]n|promocional", 0.8),
        (r"descuento", 0.6),
        (r"oferta\s+v[aá]lida", 0.8),
        (r"contrat[ae]|llama\s+al", 0.5),
        (r"pack\s+familia", 0.7),
        (r"desde\s+\d+[.,]?\d*\s*EUR", 0.6),
        (r"gratis|gratuito", 0.5),
    ],
    "contrato": [
        (r"contrato\s+de\s+servicios", 0.9),
        (r"partes?\s+del\s+contrato", 0.8),
        (r"cl[aá]usulas?", 0.7),
        (r"obligaciones", 0.6),
        (r"resoluci[oó]n", 0.4),
        (r"objeto\s+del\s+contrato", 0.85),
        (r"contraprestaci[oó]n", 0.7),
    ],
    "factura": [
        (r"factura", 0.9),
        (r"n[uú]mero\s+de\s+factura", 0.95),
        (r"base\s+imponible", 0.8),
        (r"IVA|iva", 0.6),
        (r"total\s+a\s+pagar", 0.8),
        (r"forma\s+de\s+pago", 0.5),
        (r"vencimiento\s+de\s+pago", 0.7),
    ],
}


def classify_by_content(text: str) -> tuple[str, float]:
    """Level 3: Classify document by analyzing its content."""
    text_lower = text.lower()
    scores: dict[str, float] = {}

    for doc_type, patterns in CONTENT_PATTERNS.items():
        total_score = 0.0
        matches = 0
        for pattern, weight in patterns:
            if re.search(pattern, text_lower):
                total_score += weight
                matches += 1

        if matches > 0:
            # Normalize: average weight of matched patterns, boosted by match count
            scores[doc_type] = (total_score / len(patterns)) * min(matches / 2, 1.5)

    if not scores:
        return "otro", 0.0

    best_type = max(scores, key=scores.get)  # type: ignore
    confidence = min(scores[best_type], 1.0)
    return best_type, round(confidence, 2)


def classify_by_filename(filename: str) -> tuple[str, float]:
    """Level 2: Classify by filename patterns."""
    fname = filename.lower()
    patterns = {
        "poliza": (r"poliza|póliza|seguro", 0.8),
        "siniestro": (r"siniestro|accidente|dano", 0.8),
        "resumen": (r"resumen|summary", 0.75),
        "publicidad": (r"publicidad|promo|marketing|pack", 0.75),
        "contrato": (r"contrato|convenio|acuerdo", 0.8),
        "factura": (r"factura|invoice|recibo", 0.8),
    }
    for doc_type, (pattern, confidence) in patterns.items():
        if re.search(pattern, fname):
            return doc_type, confidence
    return "otro", 0.0


def classify_document(
    filename: str,
    text: str,
    manual_type: str | None = None,
) -> tuple[str, float, str]:
    """
    Classify document using all 3 levels.
    Returns: (doc_type, confidence, method)

    Priority: manual > content > filename
    """
    # Level 1: Manual tag
    if manual_type and manual_type != "auto":
        return manual_type, 1.0, "manual"

    # Level 3: Content analysis (higher priority than filename)
    content_type, content_conf = classify_by_content(text)
    if content_conf >= 0.5:
        return content_type, content_conf, "content"

    # Level 2: Filename
    file_type, file_conf = classify_by_filename(filename)
    if file_conf > 0:
        return file_type, file_conf, "filename"

    # Fallback to content even with low confidence
    if content_conf > 0:
        return content_type, content_conf, "content"

    return "otro", 0.0, "none"


# --- Parsers ---

def parse_markdown(filepath: Path, manual_type: str | None = None) -> ParsedDocument:
    """Parse a markdown file into structured content."""
    text = filepath.read_text(encoding="utf-8")
    filename = filepath.stem

    # Classify
    doc_type, confidence, method = classify_document(filename, text, manual_type)

    # Extract title (first H1)
    title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else filename

    # Extract sections (H2, H3)
    sections: dict[str, str] = {}
    section_pattern = re.compile(r"^(#{2,3})\s+(.+?)$", re.MULTILINE)
    matches = list(section_pattern.finditer(text))
    for i, match in enumerate(matches):
        section_name = match.group(2).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[section_name] = text[start:end].strip()

    # Extract tables
    tables = _parse_tables(text)

    # Extract key-value metadata (bold patterns like **Key:** Value)
    metadata: dict[str, str] = {}
    kv_pattern = re.compile(r"\*\*(.+?)\*\*[:\s]+(.+?)(?:\n|$)")
    for match in kv_pattern.finditer(text):
        key = match.group(1).strip().rstrip(":")
        value = match.group(2).strip()
        metadata[key] = value

    return ParsedDocument(
        filename=filename,
        title=title,
        doc_type=doc_type,
        doc_type_confidence=confidence,
        classification_method=method,
        raw_text=text,
        sections=sections,
        tables=tables,
        metadata=metadata,
    )


def parse_csv_text(text: str, filename: str = "data") -> list[dict[str, str]]:
    """Parse CSV/TSV text into list of row dicts."""
    # Auto-detect delimiter
    delimiter = "\t" if "\t" in text[:500] else ","
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
    return [dict(row) for row in reader]


def parse_text(text: str, filename: str = "document", manual_type: str | None = None) -> ParsedDocument:
    """Parse raw text content (for uploaded text/pasted content)."""
    doc_type, confidence, method = classify_document(filename, text, manual_type)

    title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else filename

    metadata: dict[str, str] = {}
    kv_pattern = re.compile(r"\*\*(.+?)\*\*[:\s]+(.+?)(?:\n|$)")
    for match in kv_pattern.finditer(text):
        metadata[match.group(1).strip().rstrip(":")] = match.group(2).strip()

    return ParsedDocument(
        filename=filename,
        title=title,
        doc_type=doc_type,
        doc_type_confidence=confidence,
        classification_method=method,
        raw_text=text,
        sections={},
        tables=_parse_tables(text),
        metadata=metadata,
    )


def _parse_tables(text: str) -> list[list[dict[str, str]]]:
    """Extract markdown tables as list of row dicts."""
    tables = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if "|" in line and i + 1 < len(lines) and "---" in lines[i + 1]:
            headers = [h.strip() for h in line.split("|") if h.strip()]
            i += 2
            rows = []
            while i < len(lines) and "|" in lines[i]:
                cells = [c.strip() for c in lines[i].split("|") if c.strip()]
                if len(cells) == len(headers):
                    rows.append(dict(zip(headers, cells)))
                i += 1
            if rows:
                tables.append(rows)
        else:
            i += 1
    return tables


def parse_directory(dirpath: Path) -> list[ParsedDocument]:
    """Parse all supported files in a directory."""
    docs = []
    if not dirpath.exists():
        return docs
    for ext in ["*.md", "*.txt"]:
        for f in sorted(dirpath.glob(ext)):
            docs.append(parse_markdown(f))
    return docs
