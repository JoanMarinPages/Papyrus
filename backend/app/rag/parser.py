"""
Document parser: reads markdown files and extracts structured content.
"""
import re
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class ParsedDocument:
    filename: str
    title: str
    doc_type: str  # poliza, resumen, publicidad
    raw_text: str
    sections: dict[str, str] = field(default_factory=dict)
    tables: list[list[dict[str, str]]] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)


def parse_markdown(filepath: Path) -> ParsedDocument:
    """Parse a markdown file into structured content."""
    text = filepath.read_text(encoding="utf-8")
    filename = filepath.stem

    # Determine type
    if "poliza" in filename.lower():
        doc_type = "poliza"
    elif "resumen" in filename.lower():
        doc_type = "resumen"
    elif "publicidad" in filename.lower():
        doc_type = "publicidad"
    else:
        doc_type = "otro"

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
        raw_text=text,
        sections=sections,
        tables=tables,
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
            # Found table header
            headers = [h.strip() for h in line.split("|") if h.strip()]
            i += 2  # Skip separator
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
    """Parse all markdown files in a directory."""
    docs = []
    if not dirpath.exists():
        return docs
    for f in sorted(dirpath.glob("*.md")):
        docs.append(parse_markdown(f))
    return docs
