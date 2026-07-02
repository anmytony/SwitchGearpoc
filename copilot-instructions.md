# Copilot Instructions - ABB Medium Voltage Switchgear Co-Engineer

## Scope
These instructions apply to the entire repository.

## Working Mode
- Prioritize hackathon demo reliability over deep refactors.
- Keep human-in-the-loop behavior explicit for all low-confidence and conflicting outputs.
- Do not represent AI extraction as guaranteed engineering truth; final approval remains with domain experts.

## Frontend Rules
- Treat `frontend/switchgear-ui/src/` as source of truth when present.
- If backend services are unavailable, the local demo flow must complete the happy path using cached or mock data, with no runtime crashes or blank screens.
- Do not remove the demo fallback path unless explicitly requested.
- Always surface confidence index, flags, and deviation items in review screens.

## Backend Rules
- Preserve existing API contracts unless a change is requested.
- If implementing a request requires an API contract change, explicitly flag the breaking change before proceeding, describe consumer impact, and await confirmation.
- Keep review workflow intact: low-confidence/conflicting results must remain reviewable.
- After AI/OCR-driven extraction or inferred configuration updates, keep results in a review-required state and avoid auto-finalization.
- Add a code comment `// REQUIRES HUMAN REVIEW` at affected output decision points where automated inference is persisted.

## Package / Registry Constraint (Hard Rule)
- Use the project-approved npm registry configured for this environment.
- If npm authentication is missing or expired, run registry login for the configured source.
- If login fails or registry is unreachable, stop and inform the developer with the exact error.
- Do not silently fall back to another registry.

## Bug Tracking Rule (Hard Rule)
- Persist all newly discovered bugs in `BUG-REPORT.md` at repo root.
- A newly discovered bug is a verified defect in existing code that causes incorrect runtime behavior, crash, or security risk.
- Do not log speculative concerns, TODO items, or style issues as bugs.
- Log each bug immediately when discovered, before implementing a fix.
- Each bug entry must include:
	- ID
	- Date
	- Area (Frontend/Backend/Pipeline/Build/Infra)
	- Summary
	- Repro steps
	- Actual vs expected
	- Severity
	- Status (`Open` / `In Progress` / `Resolved`)
	- Owner

## Customization Infrastructure

- Agent registry: `agents.md`
- Scoped agent roles: `agents/`
- Scoped instructions: `instructions/`
- Project context and lessons: `context.md`, `learnings.md`
- Commit message format: `copilot-commit-message-instructions.md`
- Code review taxonomy: `copilot-review-instructions.md`

Keep this global file concise. Put detailed coding rules into scoped instruction files.

## Terminal

Windows PowerShell: use semicolons `;` to chain commands, never `&&`.

## Delivery Style
- After implementing each change, append a Verification section that lists:
	1. Exact commands to validate correctness.
	2. Expected output or pass criteria for each command.
- Do not claim results that were not actually observed.
- Keep generated/cache artifacts out of source-level summaries unless explicitly requested.
