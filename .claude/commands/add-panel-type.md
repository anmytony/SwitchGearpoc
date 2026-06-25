# Add Panel Type

Add a new switchgear panel/cubicle type to the full stack.

The new panel type is: $ARGUMENTS

If no arguments given, ask: "What is the new panel type name (e.g. 'transformer', 'capacitor_bank', 'motor_starter') and what devices does it typically contain?"

## Files to update

### 1. Python extraction (Path C vision prompt)

**`extraction-service/services/path_c/sld_vision_analyzer.py`**
- In `_SYSTEM_PROMPT`, find the `panel_type` field description
- Add the new type to the allowed list (currently: Incomer / Feeder / Coupler / Metering / Transformer / VT / Other)
- Add a brief description of its SLD symbol if distinctive

### 2. Backend models

**`backend/SwitchgearApi/Services/LineupReconstructionService.cs`**
- In `NormalizePanelType()`, add a case mapping the new type string to its canonical name
- In `SelectArticleNumber()`, add a case for the new type (use a placeholder article number or empty string)
- In `BuildDefaultLineup()` — only if this type should appear in the default fallback lineup

**`backend/SwitchgearApi/Services/PipelineOrchestrationService.cs`**
- Check if there are any type-specific rules (e.g. "incomer or outgoer get CB+CT") — add rules for the new type if needed

### 3. Frontend TypeScript

**`frontend/switchgear-ui/src/app/models/models.ts`**
- Add the new type to the `CubicleType` union: `| 'new_type'`

**`frontend/switchgear-ui/src/app/components/lineup/lineup-view.component.ts`**
- In `typeLabel()`, add a human-readable label for the new type
- In `badgeClass()`, the method uses the type directly — verify it works

**`frontend/switchgear-ui/src/app/components/lineup/lineup-view.component.scss`**
- Add a `&--new_type .cub-item__box` style block with a distinct background and border colour
- Add a `.type-badge--new_type` style in the device summary table section
- Add a `.cubicle-badge--new-type` style in the badges section

**`frontend/switchgear-ui/src/app/components/lineup/lineup-view.component.html`**
- In the SLD SVG block inside `.cub-item`, add an `@if (cub.type === 'new_type')` with an appropriate SVG symbol

## Validation

1. Run `cd frontend/switchgear-ui && npx ng build --configuration development 2>&1 | grep -i error`
2. Confirm the new type appears correctly in the lineup diagram with the right colour
3. Report all changes made
