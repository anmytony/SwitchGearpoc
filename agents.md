# ABB Medium Voltage Switchgear Agent Registry

Use this registry to choose the smallest capable agent for a task. Agents should follow [copilot-instructions.md](copilot-instructions.md) plus all matching scoped instructions.

## Core Agents

| Agent | File | Use When | Do Not Use For |
|-------|------|----------|----------------|
| Planner | [agents/planner.md](agents/planner.md) | Read-only research, architecture mapping, milestone planning, and dependency sequencing | Editing files or implementing code |
| Backend Developer | [agents/backend-developer.md](agents/backend-developer.md) | FastAPI/Python backend, pipeline stages, extraction logic, lineup reconstruction, XML generation | Angular UI implementation |
| Frontend Developer | [agents/front-end-developer.md](agents/front-end-developer.md) | Angular components, review workflows, confidence/flag UX, XML preview and download flows | Backend API/pipeline logic |
| Debugger | [agents/debugger.md](agents/debugger.md) | Runtime errors, build failures, integration issues, pipeline stage failures | Planned feature implementation |
| Tester | [agents/tester.md](agents/tester.md) | Test planning, writing, execution, and coverage analysis across API, pipeline, XML, and UI | Weakening assertions to force passing tests |

## Recommended Handoffs

| From | To | When |
|------|-----|------|
| Planner | Backend Developer | Plan identifies backend pipeline work in ingestion, classification, extraction, lineup, or XML |
| Planner | Frontend Developer | Plan identifies Angular workflow work for upload, review, deviations, and XML viewer |
| Backend Developer | Tester | Backend/pipeline changes are complete and need validation |
| Frontend Developer | Tester | UI or contract-mapping changes are complete and need validation |
| Tester | Debugger | Failure root cause is unclear or spans frontend, API, worker, and schema layers |
| Tester | Backend Developer | Failure points to API contract, pipeline logic, validation, or XML compliance |
| Tester | Frontend Developer | Failure points to UI state handling, rendering, or frontend contract mapping |

## Shared Intake Checklist

Every code-writing agent should check these before creating new code:

1. [context.md](context.md) for architecture and domain understanding.
2. [learnings.md](learnings.md) for past bugs and anti-patterns.
3. Relevant scoped instruction file under [instructions/angular-developer-instructions.md](instructions/angular-developer-instructions.md) or [instructions/dotend-developer-instructions.md](instructions/dotend-developer-instructions.md).
4. Matching role guidance in [agents/backend-developer.md](agents/backend-developer.md), [agents/front-end-developer.md](agents/front-end-developer.md), [agents/debugger.md](agents/debugger.md), [agents/tester.md](agents/tester.md), and [agents/planner.md](agents/planner.md).

## Tool Boundaries

- Planner is read-only: no file edits and no terminal commands.
- Tester prioritizes bug discovery and coverage depth: never weakens assertions to pass tests.
- Debugger diagnoses first, then hands off implementation fixes to Backend Developer or Frontend Developer.
- Developers implement fixes and features, then hand off to Tester for verification.
