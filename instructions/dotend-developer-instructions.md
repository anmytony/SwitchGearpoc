---
applyTo: "backend/**/*.py,backend/**/*.yml,backend/**/*.yaml,backend/**/*.json"
---

# Backend Instructions - ABB Medium Voltage Switchgear

## API Layer Patterns

- API routes are thin; delegate business logic to pipeline/services layer.
- Keep request/response models explicit and typed (Pydantic models).
- Return consistent status codes and payload shapes for each endpoint.
- Validate request input at API boundary before pipeline execution.
- Use async handlers for all I/O-bound operations.

## Service and Pipeline Patterns

- Register and inject dependencies from a central application wiring layer.
- Use constructor/function injection; do not instantiate shared clients inline.
- Services own business rules; API layer owns transport concerns.
- Pipeline stages must be isolated and testable: ingestion, classification, extraction, lineup, XML generation.
- Every stage output must carry traceability metadata: source page, confidence score, and stage id.
- AI-generated or inferred values must be marked review-required when confidence is below threshold.

## Data Validation and Contracts

- Enforce strict schema validation for request, response, and intermediate pipeline models.
- Confidence values must be normalized to 0.0-1.0.
- Use canonical units and normalized enums for voltage, short-circuit level, IP/IAC, and topology fields.
- Do not silently drop unknown fields from upstream extraction; log and surface as deviations when relevant.
- Keep frontend/backend contracts versioned and backward-compatible where feasible.

## Persistence and Catalog Rules

- Use repository/DAO patterns to isolate storage concerns from pipeline logic.
- Prefer ORM/query builder patterns; avoid ad-hoc SQL unless absolutely necessary.
- Catalog lookups must be versioned and deterministic.
- Missing optional values should apply ABB defaults and create a deviation flag.
- Missing required values should stop final export readiness and require human review.

## Error Handling

- Catch and classify errors by type: validation, dependency failure, processing failure, schema failure.
- Return precise status codes (400 validation, 404 resource not found, 409 conflict, 422 domain validation, 500 internal).
- Never return internal stack traces in production responses.
- Log structured error context with request id, document id, stage, and correlation id.
- For retryable failures (OCR/network/timeouts), mark stage retry state explicitly.

## AI and OCR Integration Rules

- Validate AI/OCR response structure before consuming extracted fields.
- Persist raw model output reference for auditability where policy allows.
- Never fabricate extraction values when external AI/OCR fails.
- Include confidence and provenance with every inferred parameter and device mapping.
- Contradictory values from different pages must be surfaced in deviations, not auto-resolved silently.

## XML Generation and Compliance

- XML generation must be deterministic from the normalized configuration model.
- Validate generated XML against ABB XSD before exposing ready-for-import status.
- XML nodes must include required article/quantity/configuration fields.
- If schema validation fails, return structured validation diagnostics and keep payload for review.
- Prevent partial export states that appear successful without schema compliance.

## Security and Configuration

- No hardcoded credentials, API keys, or secrets; use environment variables and secure config providers.
- Validate all uploads by file extension, MIME type, and size limits.
- Sanitize and validate all user-provided textual and numeric inputs.
- Restrict CORS to approved frontend origins only.
- Apply least-privilege access for storage, database, and model-provider credentials.

## Observability and Reliability

- Emit structured logs and stage-level metrics (latency, error rate, confidence distribution).
- Add health/readiness checks for API, queue, storage, and model dependencies.
- Support idempotent re-processing for the same document id.
- Use queue-based execution with timeout/retry policies for long-running stages.
- Preserve end-to-end correlation ids for API -> worker -> pipeline tracing.
