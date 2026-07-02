# Commit Message Instructions

## Format

```
<type>(<scope>): <imperative-verb> <what-changed>

[optional body: WHY this change was needed, not what changed]

[optional footer: Breaking changes, issue refs]
```

## Types

`feat` | `fix` | `refactor` | `chore` | `docs` | `test` | `style` | `perf`

## Scopes

| Scope | Directory / Area |
|-------|-------------------|
| `api` | backend API routes, request/response contracts |
| `pipeline` | ingestion, classification, extraction, lineup, mapping logic |
| `xml` | XML generation, schema validation, export flow |
| `data` | persistence models, repositories, catalog data mappings |
| `ai` | OCR/LLM integration, confidence scoring, extraction prompts |
| `ui` | frontend/switchgear-ui/src/ |
| `review` | human-in-the-loop review workflow, deviations, overrides |
| `build` | dependency/config files (package, pipeline, task configs) |
| `deploy` | environment settings, runtime configuration, infra wiring |
| `agents` | agents/*.md role definitions |
| `instructions` | instructions/*.md scoped coding instructions |
| `docs` | context.md, learnings.md, agents.md, other markdown docs |
| `test` | unit, integration, e2e, and schema-compliance tests |

## Rules

- Subject line: imperative mood, <=72 chars, no period
- Body: wrap at 100 chars, explain WHY not WHAT
- Breaking changes: `BREAKING CHANGE:` footer
- Multi-scope: use comma `feat(api,ui): add confidence flags endpoint rendering`

## Use Case-Specific Guidance

- Prefer `pipeline` when the change affects extraction, normalization, lineup reconstruction, or mapping stages.
- Prefer `review` when the change affects low-confidence handling, deviations, or manual overrides.
- Prefer `xml` for schema/XSD validation and configurator export behavior.
- Use `docs` for updates to agent instructions, context, and process documentation.

## Examples

```
feat(pipeline): add normalized short-circuit extraction with source tracing

fix(xml): enforce schema validation before export readiness

refactor(api,pipeline): split document processing orchestration into stage services

feat(ui,review): show low-confidence deviations with override controls

test(pipeline,xml): add regression tests for lineup-to-xml mapping consistency

docs(agents,instructions): align agent roles and coding rules to switchgear workflow
```
