import logging

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain_core.documents import Document

from config import settings

logger = logging.getLogger(__name__)

# Persistent knowledge index — never deleted, pre-loaded with IEC standards and catalogues.
KNOWLEDGE_INDEX_NAME = f"{settings.azure_search_index_name}-knowledge"


def _index_client() -> SearchIndexClient:
    return SearchIndexClient(
        endpoint=settings.azure_search_endpoint,
        credential=AzureKeyCredential(settings.azure_search_api_key),
    )


def check_index_exists(index_name: str) -> bool:
    return index_name in {idx.name for idx in _index_client().list_indexes()}


def delete_index(index_name: str) -> None:
    try:
        _index_client().delete_index(index_name)
        logger.info(f"[PathB] Deleted index: {index_name}")
    except Exception as exc:
        logger.warning(f"[PathB] Could not delete index {index_name}: {exc}")


def build_index(document_id: int, chunks: list[Document]) -> AzureSearch:
    embeddings = OpenAIEmbeddings(
        model=settings.azure_openai_embedding_deployment,
        api_key=settings.azure_openai_api_key,
        base_url=settings.azure_openai_endpoint,
    )
    index_name = f"{settings.azure_search_index_name}-{document_id}"

    vectorstore = AzureSearch(
        azure_search_endpoint=settings.azure_search_endpoint,
        azure_search_key=settings.azure_search_api_key,
        index_name=index_name,
        embedding_function=embeddings.embed_query,
        search_type="hybrid",
    )

    if check_index_exists(index_name):
        logger.info(f"[PathB] Reusing existing index: {index_name}")
    else:
        vectorstore.add_documents(chunks)
        logger.info(f"[PathB] Built index {index_name} with {len(chunks)} chunks")

    return vectorstore


def retrieve_chunks_with_scores(
    vectorstore: AzureSearch, query: str, k: int = 3
) -> list[tuple[Document, float]]:
    return vectorstore.similarity_search_with_score(query, k=k)


def get_knowledge_store() -> AzureSearch | None:
    """Return the persistent knowledge index if it exists, else None."""
    try:
        if not check_index_exists(KNOWLEDGE_INDEX_NAME):
            return None
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
    except Exception as exc:
        logger.warning(f"[PathB] Could not connect to knowledge index: {exc}")
        return None
