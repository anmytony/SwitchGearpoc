# Code Review Instructions

Review backend, frontend, pipeline, and AI/OCR integration code against these project rules. Flag violations with severity.

## CRITICAL - Will Break Production, Safety, or Delivery

- Any auto-finalization of AI/OCR-derived outputs without human review for low-confidence or conflicting items
- Hardcoded credentials, API keys, tokens, or connection strings in source code
- Missing `// REQUIRES HUMAN REVIEW` comment at automated inference persistence/output decision points
- Breaking API contract changes made without explicit flagging and confirmation
- Removing or bypassing demo fallback behavior needed for hackathon happy-path reliability
- XML marked as export-ready without successful schema/XSD validation
- Silent suppression of deviations or confidence flags in API or UI output

## HIGH - Security, Compliance, and Data Integrity

- Logging secrets, tokens, customer-sensitive data, or proprietary document contents unsafely
- Missing input validation on upload endpoints or review override endpoints
- Missing file validation (type, extension, MIME, size) for uploaded RFQ documents
- CORS policy overly permissive for production/deployment settings
- Missing authorization checks on destructive or override endpoints
- Confidence scores not validated/ranged (must be 0.0-1.0)
- Source traceability missing for extracted parameters (source page/provenance absent)
- Contradictory extracted values overwritten without creating a deviation record

## MEDIUM - Engineering Patterns and Reliability

- Pipeline stages tightly coupled and not independently testable
- Async calls not awaited or task/promise failures swallowed
- Missing structured error handling for dependency failures (OCR/LLM/queue/storage)
- Frontend components missing loading/error/empty states
- Observable subscriptions not cleaned up (unless async pipe/takeUntilDestroyed pattern is used)
- TypeScript `any` usage where a defined interface should be used
- Missing error handling for HTTP calls in frontend services
- Catalog lookup failures not flagged and not routed to review workflow

## LOW - Consistency and Documentation

- Naming inconsistencies (backend and frontend conventions not followed)
- Missing docstrings/comments on exported/public API surfaces where project standards require them
- Missing update to context/instruction docs for new core workflow or endpoint behavior
- Commit message does not follow repository commit format rules
- Minor duplication or readability issues that do not alter behavior

## Review Output Format

Use this structure when reporting findings:

```markdown
## Review Findings

**Scope:** <files/features reviewed>
**Result:** clean | issues found

### CRITICAL
- <finding with file and impact>

### HIGH
- <finding with file and impact>

### MEDIUM
- <finding with file and impact>

### LOW
- <finding with file and impact>

**Open Questions / Assumptions:**
- <uncertainties that affect confidence>

**Recommended Next Step:**
- <who should fix what next>
```
