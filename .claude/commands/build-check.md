# Build Check

Build both the backend and frontend and report all errors and warnings.

## Backend (.NET)

Run: `cd backend/SwitchgearApi && dotnet build 2>&1`

Look for:
- Build errors (must fix)
- Nullable reference warnings (should fix)
- Unused variable warnings

## Frontend (Angular)

Run: `cd frontend/switchgear-ui && npx ng build --configuration development 2>&1`

Look for:
- TypeScript compilation errors (must fix)
- NG8xxx template warnings (review — some are false positives)
- Bundle size warnings

## Python (extraction service)

Run: `cd extraction-service && python -c "import main; print('OK')" 2>&1`

Also check imports in key files:
- `services/path_b/rag_extractor.py`
- `services/path_c/sld_vision_analyzer.py`
- `ensemble/voting.py`

## Report

For each layer, report:
- ✅ Clean build
- ⚠️ Warnings (list them)
- ❌ Errors (list them with file:line)

Then fix any errors found, re-run the affected build, and confirm it passes.
