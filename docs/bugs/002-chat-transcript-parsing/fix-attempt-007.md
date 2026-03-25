# Fix Attempt 007

## Attempt Status
Fixed locally, awaiting user confirmation

## Goal
Promote unmapped sessions out of `Unknown` and into top-level project cards derived from the workspace directory.

## Relation To Previous Attempts
Follow-up after Attempt 006 fixed scrollbar visibility but the sidebar still showed an `Unknown` bucket containing the real project groups.

## Proposed Change
- Derive top-level project identity from `workspace.yaml.cwd` when there is no project mapping.
- Keep mapped sessions on their existing project buckets.
- Preserve the workspace path on the session for traceability.
- Keep the compact tooltip-based project header.

## Risks
- If the fallback path is missing, those sessions will still need a safe `Unknown` bucket.
- The project grouping hash must remain stable across reloads.

## Files And Components
- `src/main/data/explorer.ts`
- `src/main/data/parser.ts`
- `src/common/types.ts`
- `tests/unit/data-access.test.ts`

## Verification Plan
- Run `bun test`.
- Run `bun run build`.
- Confirm the sidebar no longer contains an `Unknown` bucket for sessions that have `workspace.yaml.cwd`.

## Implementation Summary
- Restored top-level project derivation from `workspace.yaml.cwd` when no session mapping exists.
- Kept mapped sessions on their existing project buckets.
- Removed the nested tree grouping so fallback projects now appear at the top level instead of under `Unknown`.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Locally fixed. Sessions that have a workspace directory now promote into top-level project cards, and `Unknown` should only remain for sessions without a usable fallback path.

## Next Step
Ask the user to confirm the sidebar now shows the fallback projects at the top level.

## Remaining Gaps
- Need to confirm the top-level fallback does not reintroduce the earlier overly-cluttered project list for mapped sessions.
