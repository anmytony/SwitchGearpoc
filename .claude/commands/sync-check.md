# Sync Check

Verify that the backend DTOs, Python response models, and frontend TypeScript models are fully consistent with each other. Report any mismatches.

## Step 1 — Read all contract files

Read these files completely:

**Python (extraction service output)**
- `extraction-service/models/response.py` — `ExtractedParameterResult`, `CubicleDeviceResult`
- `extraction-service/models/request.py` — `PageData`, `InstanceData`, `PythonExtractionRequest`

**Backend C# (API layer)**
- `backend/SwitchgearApi/Dtos/DtoModels.cs` — all DTO classes
- `backend/SwitchgearApi/Models/` — EF Core entity models (read all .cs files)
- `backend/SwitchgearApi/Controllers/DocumentsController.cs` — what the API actually returns

**Frontend TypeScript**
- `frontend/switchgear-ui/src/app/models/models.ts` — all interfaces
- `frontend/switchgear-ui/src/app/services/pipeline-api.service.ts` — how raw API JSON is mapped to models

## Step 2 — Check for mismatches

For each data structure that flows through the system, verify:

1. **Field names** — Python snake_case → C# PascalCase → JSON camelCase → TypeScript camelCase. Check the serialization chain is correct.
2. **Field types** — e.g. a Python `float` becoming a C# `double` becoming a TypeScript `number` — all compatible?
3. **Missing fields** — a field added to the Python response but not mapped in the C# controller, or added to the DTO but not in the frontend model or service mapper.
4. **Nullable consistency** — Python `Optional[str]` vs C# `string?` vs TypeScript `string | null`.
5. **Enum values** — Python string literals vs C# string constants vs TypeScript union types — do they match exactly?

## Step 3 — Check the mapping functions

In `pipeline-api.service.ts`, find all `map*()` private methods. For each one:
- Does it handle all fields from the corresponding DTO?
- Does it have safe fallbacks (`?? null`, `?? ''`, `?? []`) for optional fields?
- Does it cast types correctly (e.g. `Number(item.position ?? 0)`)?

## Step 4 — Report

Produce a table:

| Field | Python | C# DTO | TS Model | Mapper | Status |
|-------|--------|--------|----------|--------|--------|
| fieldName | ✓ | ✓ | missing | N/A | ❌ GAP |

List all gaps with the exact file and line where the fix should go. Then apply the fixes.
