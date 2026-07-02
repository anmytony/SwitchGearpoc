"""
Load a knowledge document (IEC standard, manufacturer catalogue, etc.)
into a persistent Azure AI Search knowledge index.

The knowledge index is SEPARATE from the per-document index (which is deleted
after each extraction). Knowledge documents persist and are queried alongside
every customer document processed.

Usage:
    cd extraction-service
    python scripts/load_knowledge_doc.py path/to/IEC62271-200.pdf "IEC 62271-200"
    python scripts/load_knowledge_doc.py path/to/abb_unigear.pdf "ABB UniGear ZS1"

List what is already indexed:
    python scripts/load_knowledge_doc.py --list

Remove a document from the index:
    python scripts/load_knowledge_doc.py --remove "IEC 62271-200"
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

try:
    import pdfplumber
except ImportError:
    logger.error("pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

from config import settings

KNOWLEDGE_INDEX_NAME = f"{settings.azure_search_index_name}-knowledge"

# Switchgear-relevant keywords — pages without any of these are skipped
_SPEC_KEYWORDS = {
    "kv", "ka", "busbar", "switchgear", "rated", "voltage", "current",
    "frequency", "insulation", "protection", "arc", "iac", "iec", "ansi",
    "circuit breaker", "transformer", "relay", "cubicle", "panel",
    "tensione", "corrente", "sbarra", "isolamento", "disjoncteur",
    "tension", "courant", "leistungsschalter", "spannung",
}


def _is_relevant(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in _SPEC_KEYWORDS)


def _load_pdf(pdf_path: str, doc_name: str) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " "]
    )
    docs: list[Document] = []
    skipped = 0

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        for i, page in enumerate(pdf.pages, 1):
            text = (page.extract_text() or "").strip()
            if not text:
                skipped += 1
                continue
            if not _is_relevant(text):
                skipped += 1
                continue

            chunks = splitter.split_text(text)
            for chunk in chunks:
                docs.append(Document(
                    page_content=chunk,
                    metadata={
                        "page":        i,
                        "source":      doc_name,
                        "source_type": "knowledge",
                        "type":        "paragraph",
                    }
                ))

            if i % 20 == 0:
                logger.info(f"  Processed {i}/{total} pages, {len(docs)} chunks so far...")

    logger.info(f"  Pages: {total} total, {skipped} skipped (irrelevant/blank), {total - skipped} indexed")
    return docs


def _get_vectorstore() -> AzureSearch:
    embeddings = OpenAIEmbeddings(
        model=settings.azure_openai_embedding_deployment,
        api_key=settings.azure_openai_api_key,
        base_url=settings.azure_openai_endpoint,
    )
    return AzureSearch(
        azure_search_endpoint=settings.azure_search_endpoint,
        azure_search_key=settings.azure_search_api_key,
        index_name=KNOWLEDGE_INDEX_NAME,
        embedding_function=embeddings.embed_query,
        search_type="hybrid",
    )


def load_document(pdf_path: str, doc_name: str) -> None:
    if not os.path.exists(pdf_path):
        logger.error(f"File not found: {pdf_path}")
        sys.exit(1)

    logger.info(f"Loading '{doc_name}' from: {pdf_path}")
    docs = _load_pdf(pdf_path, doc_name)

    if not docs:
        logger.warning("No relevant content found — nothing indexed.")
        return

    logger.info(f"  Indexing {len(docs)} chunks into '{KNOWLEDGE_INDEX_NAME}'...")
    vs = _get_vectorstore()
    vs.add_documents(docs)
    logger.info(f"Done. '{doc_name}' is now available for all future extractions.")


def list_documents() -> None:
    client = SearchClient(
        endpoint=settings.azure_search_endpoint,
        index_name=KNOWLEDGE_INDEX_NAME,
        credential=AzureKeyCredential(settings.azure_search_api_key),
    )
    try:
        results = client.search("*", select=["source"], top=1000)
        sources: dict[str, int] = {}
        for r in results:
            src = r.get("source", "unknown")
            sources[src] = sources.get(src, 0) + 1
        if not sources:
            logger.info("Knowledge index is empty.")
        else:
            logger.info(f"Knowledge index '{KNOWLEDGE_INDEX_NAME}' contains:")
            for src, count in sorted(sources.items()):
                logger.info(f"  {src:50s} {count:5d} chunks")
    except Exception as exc:
        logger.error(f"Could not list index (may not exist yet): {exc}")


def remove_document(doc_name: str) -> None:
    client = SearchClient(
        endpoint=settings.azure_search_endpoint,
        index_name=KNOWLEDGE_INDEX_NAME,
        credential=AzureKeyCredential(settings.azure_search_api_key),
    )
    results = list(client.search("*", filter=f"source eq '{doc_name}'", select=["id"], top=1000))
    if not results:
        logger.info(f"'{doc_name}' not found in knowledge index.")
        return
    ids = [{"id": r["id"]} for r in results]
    client.delete_documents(ids)
    logger.info(f"Removed {len(ids)} chunks for '{doc_name}' from knowledge index.")


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or args[0] == "--list":
        list_documents()
    elif args[0] == "--remove" and len(args) >= 2:
        remove_document(args[1])
    elif len(args) >= 2:
        load_document(args[0], args[1])
    else:
        print(__doc__)
        sys.exit(1)
