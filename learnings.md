# ABB Medium Voltage Switchgear - Lessons Learned

> **Not auto-loaded.** Agents read this when debugging or making decisions that could repeat past mistakes.
> When a bug is found and fixed, **add a lesson** using the tagged format below.

## How to Use This File

**Session start**: Agents should scan this file when working on areas that have known pitfalls.
**After a bug fix**: Add a new tagged entry under the appropriate category. Use this format:

```
- **Short title**: Description of the problem and fix.
	`tags: layer, root-cause-type` | `found: YYYY-MM-DD` | `files: affected/file`
```

**Tag vocabulary**:
- Layer: `backend`, `frontend`, `api`, `pipeline`, `xml`, `ocr`, `llm`, `storage`, `queue`, `build`, `deploy`, `test`, `config`
- Root cause: `api-contract`, `schema-mismatch`, `missing-field`, `data-normalization`, `mapping-error`, `missing-validation`, `timing`, `silent-failure`, `security`, `config`, `dependency`, `state-sync`

**When a lesson repeats 3+ times** (same root-cause-type across different incidents), escalate it:
promote to a preventive rule in the relevant instruction file under `instructions/` or role file under `agents/`.

---

## Backend / API / Pipeline

- **No-fallback extraction policy must be enforced end-to-end**: Backend fallback logic that backfilled cubicle devices from SLD result made UI appear populated even when extraction service did not return device rows. Removed fallback path to keep missing extractions explicitly empty.
	`tags: backend, missing-validation` | `found: 2026-06-24` | `files: backend/SwitchgearApi/Services/PipelineOrchestrationService.cs`
- **Lineup details require exact contract match, not inferred mapping**: Device detail rendering should rely on explicit `lineup/devices` extraction output. Index-based or legacy endpoint fallback can hide extraction gaps and produce misleading panel data.
	`tags: api, mapping-error` | `found: 2026-06-24` | `files: backend/SwitchgearApi/Controllers/DocumentsController.cs`

## Frontend / Review UX

- **Strict template checks require guarded optional access**: Optional nested fields in Angular templates (`breakingCapacity`, `accuracyClass`) must use guard + non-null assertion inside guarded blocks to pass strict compilation.
	`tags: frontend, missing-validation` | `found: 2026-06-24` | `files: frontend/switchgear-ui/src/app/components/lineup/cubicle-device-details.component.html`
- **Do not silently map legacy device data into enriched panel details**: Frontend fallback mapping from legacy `cubicle-devices` to enriched detail schema masked extraction failures. Keep detail panel empty when enriched extraction has no record.
	`tags: frontend, state-sync` | `found: 2026-06-24` | `files: frontend/switchgear-ui/src/app/components/lineup/lineup-view.component.ts`

## AI / OCR / Extraction

- **Path B instance routing bug can invalidate multi-instance device extraction**: Mis-indented `_resolve_instance_index` logic caused early return and unreachable matching path, assigning rows to wrong instance. Fixed control flow and verified with `py_compile`.
	`tags: pipeline, state-sync` | `found: 2026-06-24` | `files: extraction-service/services/path_b/device_table_extractor.py`
- **Device schema completeness does not guarantee populated values**: `cb_breaking_capacity`, `ct_accuracy_class`, and `vt_accuracy_class` are supported fields, but remain empty unless visible/parsable in source text. Treat empties as true extraction outcomes, not values to backfill.
	`tags: ocr, missing-field` | `found: 2026-06-24` | `files: extraction-service/models/response.py`

## XML / Configurator Compliance

_(No entries yet)_

## Build / Deploy / Infra

_(No entries yet)_

## Testing / Quality

_(No entries yet)_
