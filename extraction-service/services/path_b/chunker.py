import re
from collections import Counter

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from models.request import PageData

_SPEC_KEYWORDS = {
    "kv", "ka", "busbar", "switchgear", "rated", "voltage", "current",
    "frequency", "insulation", "protection", "arc", "iac", "iec", "ansi",
    # Italian
    "tensione", "corrente", "frequenza", "sbarra", "isolamento", "protezione",
    "quadro", "sbarre", "omnibus", "nominale", "cortocircuito",
    # French
    "tension", "courant", "jeu de barres", "isolement",
    # German
    "spannung", "strom", "sammelschiene", "isolierung",
}


def _is_spec_page(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in _SPEC_KEYWORDS)


def build_chunks(pages: list[PageData]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,   # doubled from 500 → ~half as many chunks → faster index build
        chunk_overlap=80,
        separators=["\n\n", "\n", ". ", " "]
    )
    docs = []
    for page in pages:
        if page.page_type == "sld" or not page.text.strip():
            continue
        # Skip pages with no switchgear-relevant terms — reduces index size
        if not _is_spec_page(page.text):
            continue
        if _is_table(page.text):
            docs.append(Document(
                page_content=page.text,
                metadata={"page": page.page_number, "type": "table"}
            ))
        else:
            chunks = splitter.split_text(page.text)
            for chunk in chunks:
                docs.append(Document(
                    page_content=chunk,
                    metadata={"page": page.page_number, "type": "paragraph"}
                ))
    return docs


def _is_table(text: str) -> bool:
    lines = [l for l in text.strip().split("\n") if l.strip()]
    if len(lines) < 3:
        return False

    # Style 1: Markdown / CSV — tab or pipe separated
    tab_lines = sum(1 for l in lines if "\t" in l or "|" in l)
    if tab_lines >= len(lines) * 0.5:
        return True

    # Style 2: Azure DI output — columns separated by 2+ spaces
    # e.g. "B01  Incomer  VD4-1250  1250A  400/5A  REF615"
    col_counts = [
        len([c for c in re.split(r'\s{2,}', l.strip()) if c])
        for l in lines
    ]
    multi_col = [n for n in col_counts if n >= 3]
    if len(multi_col) < 3:
        return False
    dominant_count, dominant_freq = Counter(multi_col).most_common(1)[0]
    return dominant_freq >= len(multi_col) * 0.6
