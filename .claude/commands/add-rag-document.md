# Add RAG Document

Load a domain knowledge document into the vector store to improve RAG-based extraction (Path B).

The document to add: $ARGUMENTS

If no arguments given, ask: "What document do you want to add? (e.g. IEC 62271-200, ABB UniGear ZS1 catalogue, a customer spec sheet)"

## Background

Path B extraction works by:
1. Chunking the uploaded PDF pages into text segments
2. Indexing them in Azure AI Search (vector store)
3. At extraction time, searching the index for chunks relevant to each parameter
4. Sending retrieved chunks as context to the LLM

The same vector store is used for retrieval. If we pre-load IEC standard documents or manufacturer catalogues, the LLM gets richer context for every customer document processed.

## Step 1 — Find the indexing code

Read:
- `extraction-service/services/path_b/vector_index.py` — how chunks are created and indexed
- `extraction-service/services/path_b/chunker.py` — chunk size / overlap settings
- `extraction-service/main.py` — where the vector store is initialised

Understand:
- What Azure AI Search index is being used?
- What metadata fields are stored per chunk (page number, document id, etc.)?
- What embedding model is used?

## Step 2 — Assess the document type

Based on the document provided ($ARGUMENTS), determine:
- Is it a standards document (IEC/IEEE)? → focus on parameter definitions and allowed values
- Is it a manufacturer catalogue? → focus on model names, ratings, configurations
- Is it a customer spec template? → focus on parameter naming conventions and units

## Step 3 — Suggest ingestion approach

There are two ways to inject the knowledge:

**Option A — Static prompt injection (no vector store)**
Extract the most relevant rules and values directly into the `_SYSTEM_PROMPT` strings. Best for:
- Short reference tables (allowed voltage levels, standard current ratings)
- Naming convention rules
- Manufacturer model families

**Option B — RAG document loading (vector store)**
Write a script that reads the PDF, chunks it, and indexes it. Best for:
- Long technical documents (IEC standards = 100+ pages)
- Documents that need semantic search to find relevant sections
- Content that changes per-project

## Step 4 — Implement

For Option A: Edit the relevant `_SYSTEM_PROMPT` sections in `rag_extractor.py` and `sld_vision_analyzer.py`.

For Option B: Create a script `extraction-service/scripts/load_knowledge_doc.py` that:
1. Reads the PDF file path from an argument
2. Chunks the text using the same chunker as the main pipeline
3. Indexes it into the same Azure AI Search index with a `source_type: "knowledge"` metadata flag
4. Reports how many chunks were indexed

## Step 5 — Update PARAMETER_QUERIES

After loading the document, review `PARAMETER_QUERIES` in `rag_extractor.py`.
Add any new terminology from the document that would help retrieve the right chunks.
