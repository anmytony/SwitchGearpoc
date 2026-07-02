---
applyTo: "frontend/**/*.ts,frontend/**/*.html,frontend/**/*.scss"
---

# Angular Frontend Instructions - ABB Medium Voltage Switchgear

## Component Patterns

- Use standalone components where practical (Angular 17+).
- Smart components handle orchestration and API calls; presentational components render data and emit events.
- Every component must handle loading state, error state, and empty state.
- Use OnPush change detection for data-heavy and list-heavy views.
- Use async pipe or takeUntilDestroyed to prevent subscription leaks.

## Service Patterns

- PipelineApiService handles HTTP calls to backend pipeline endpoints.
- ReviewStateService stores selected document, user overrides, and unsaved review changes.
- DemoDataService provides cached/demo fallback for full happy-path demos when backend services are unavailable.
- Do not remove the demo fallback path unless explicitly requested.
- Use typed HttpClient responses and centralize error translation into user-friendly messages.

## TypeScript Rules

- Define interfaces in frontend model files and keep them aligned with backend DTO contracts.
- Avoid any where typed models are possible.
- Use strict null checks and defensive guards before nested field access.
- Model all confidence and review fields explicitly: confidence_index, flags, deviations, source_page.
- Keep mapper functions pure for API-to-UI transformations.

## Template Rules

- Use Angular template bindings; do not manipulate DOM directly.
- Guard all data-bound sections with loading and null-safe conditions before rendering.
- Show confidence badges and review markers at field level, row level, and summary level.
- Highlight defaulted values (filled by ABB standards) separately from extracted values.
- Use trackBy for long lists such as pages, parameters, cubicles, and deviation items.

## UI Workflow Requirements

- Upload flow must support multi-file RFQ packages and show per-file status.
- Classification view must show page type (text_tabular or visual_sld) plus confidence.
- Parameter review screen must show value, unit, source page, confidence, and override controls.
- Lineup view must render cubicle sequence and topology warnings (incomer/outgoer/coupler consistency).
- XML view must support preview, copy/download, and schema-validation status indicator.
- Deviation panel must support filtering by severity and resolution state.

## API Contract Expectations

- Render and persist confidence_index at document, stage, and field levels.
- Render flags and deviations exactly as backend returns them; do not silently suppress unknown flags.
- Preserve source traceability (source_page, extraction_reason) in UI state.
- Enforce single expected status code per endpoint behavior during client handling and tests.
- Handle polling for processing status with backoff and cancellation on component destroy.

## NPM Registry and Dependency Rules

- Use the project-approved npm registry configured for this environment.
- If install/authentication fails, stop and report clearly; do not silently switch registries.
- Keep dependency additions minimal and justified by feature value.

## Styling and UX

- Design for dense technical data readability first: clear hierarchy, strong typography, and compact tables.
- Use semantic color coding for status (ok, warning, review required, failed) with accessible contrast.
- Ensure responsive behavior for desktop and laptop review workflows.
- Avoid layout shifts while polling; reserve space for status and warning elements.

## State Management

- Use signals or RxJS stores consistently within a feature.
- Keep document processing lifecycle explicit: uploaded, processing, extracted, review_required, ready_for_xml, exported.
- Track review decisions per field/cubicle/deviation item, not as a single global flag.
- Prevent accidental loss of reviewer edits with dirty-state prompts.

## Quality Gates Before Handoff

1. ng build passes with strict TypeScript checks.
2. Core flow works end-to-end: upload -> process -> review -> XML preview/download.
3. Loading/error/empty states are verified for every major screen.
4. Confidence, flags, and deviations are visible and testable in UI.
5. No hardcoded API URLs or secrets; use environment configuration only.
