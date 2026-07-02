## Description

<!-- Brief description of what this PR does and why it is needed -->

## Type of Change

- [ ] feat - New feature
- [ ] fix - Bug fix
- [ ] refactor - Code restructuring without behavior change
- [ ] chore - Build, config, or dependency changes
- [ ] docs - Documentation only
- [ ] test - Adding or updating tests
- [ ] perf - Performance improvement

## Workstreams Affected

- [ ] API layer (upload, status, parameters, lineup, deviations, xml)
- [ ] Pipeline (ingestion, classification, extraction, normalization)
- [ ] Lineup reconstruction and ABB mapping rules
- [ ] XML generation and schema validation
- [ ] Frontend review UX (confidence, flags, deviations, overrides)
- [ ] Build / Config / Infra
- [ ] Tests

## Checklist

- [ ] Backend build/lint/tests pass for affected scope
- [ ] Frontend build/tests pass for affected scope
- [ ] No hardcoded credentials, tokens, or secrets in code
- [ ] API contract changes are flagged and approved before merge
- [ ] Low-confidence and conflicting outputs remain reviewable (no silent auto-finalization)
- [ ] Confidence fields are present and within range (0.0-1.0)
- [ ] Deviations are surfaced (not suppressed) for missing/conflicting values
- [ ] XML is validated against schema/XSD before marked export-ready
- [ ] Demo fallback path still works if backend or AI services are unavailable
- [ ] BUG-REPORT.md updated if a new bug was discovered
- [ ] learnings.md updated if a repeatable lesson was identified

## Demo Impact

- [ ] This change affects the demo flow
- [ ] Demo flow tested end-to-end after this change
- [ ] No demo flow impact

If demo flow is affected, specify impacted steps:

- [ ] Upload RFQ package
- [ ] Classification view
- [ ] Parameter review
- [ ] Lineup visualization
- [ ] Deviation handling / override
- [ ] XML preview / export

## Verification Evidence

List the exact commands run and observed outcomes.

```text
<command>
<observed output/pass criteria>
```

## Screenshots / Artifacts

<!-- For UI changes, include before/after screenshots. -->
<!-- For backend changes, include sample payloads/log excerpts or schema validation evidence. -->

## Risk and Rollback

- Risk level: [ ] Low  [ ] Medium  [ ] High
- Primary risk:
- Rollback plan:

## Reviewer Focus

<!-- Call out 2-5 specific files/areas reviewers should inspect first. -->
