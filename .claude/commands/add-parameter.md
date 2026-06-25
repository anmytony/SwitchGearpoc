# Add Extraction Parameter

Add a new switchgear parameter to the full extraction pipeline end-to-end.

The parameter name and details are: $ARGUMENTS

If no arguments given, ask the user: "What is the parameter name, unit, and expected values (if enum)?"

## Files to update in order

### 1. Python extraction layer

**`extraction-service/services/path_b/rag_extractor.py`**
- Add entry to `PARAMETER_QUERIES` dict — multilingual search terms (EN/FR/IT/DE) that would appear near this value in a spec sheet
- Add entry to `PARAMETER_UNITS` dict — the unit string (e.g. "kV", "A", "Hz", or "" for enums)
- If it is an enum (fixed allowed values), add its name to `_ENUM_PARAMS` set
- Add the field to the `_AllParams` Pydantic model with default `= ""`
- Add a description line to `_SYSTEM_PROMPT` explaining what to extract and how

**`extraction-service/services/path_c/sld_vision_analyzer.py`**
- Add the same entry to `_UNIT_MAP`
- If enum, add to `_ENUM_PARAMS`
- Add a description line to `_SYSTEM_PROMPT` under SYSTEM PARAMETERS

**`extraction-service/ensemble/voting.py`**
- Read the file first
- If it is an enum or has known valid values, add an entry to `ALLOWED_VALUES`

### 2. Backend .NET layer

**`backend/SwitchgearApi/Dtos/DtoModels.cs`** or wherever `ExtractedParameterDto` is defined
- Verify the DTO already handles arbitrary parameter names via a `Name`/`Value` pair (check the existing pattern) — if so, no change needed

**`backend/SwitchgearApi/Services/PipelineOrchestrationService.cs`** or the XML generation service
- Check if the parameter needs special handling in XML output or scoring logic
- Add it if needed, following the pattern of existing parameters

### 3. Frontend layer

**`frontend/switchgear-ui/src/app/models/models.ts`**
- Check if `ExtractedParameter` interface covers it generically (name/value/unit) — if so, no change needed
- If a specific typed field is needed, add it

**`frontend/switchgear-ui/src/app/components/`**
- Find where extracted parameters are displayed (the review/parameters view)
- Check if the new parameter will appear automatically or needs a special display rule

## Validation

After making changes:
1. Run `cd extraction-service && python -c "from services.path_b.rag_extractor import _AllParams; print('OK')"` to verify Python syntax
2. Run `cd frontend/switchgear-ui && npx ng build --configuration development 2>&1 | grep -i error` to verify frontend builds
3. Report what was changed and what the parameter will look like in the UI
