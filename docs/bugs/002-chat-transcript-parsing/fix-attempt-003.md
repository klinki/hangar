# Fix Attempt 003

## Attempt Status
Fixed locally, awaiting user confirmation

## Goal
Group sidebar sessions by their workspace directory when the session store does not provide a mapping.

## Relation To Previous Attempts
Follow-up after Attempt 002 fixed scrolling but the sidebar still collapsed unmapped sessions into a single `Unknown` group.

## Proposed Change
- Read `workspace.yaml` from each session directory and extract the `cwd` path.
- Fall back to that directory path when `session-store.db` has no mapping for a session.
- Use the fallback path to derive a stable project id and a human-readable directory name.
- Surface the directory path in the sidebar so the grouping is obvious to the user.

## Risks
- Some `workspace.yaml` files may be missing or incomplete.
- Directory names can still collide, so the full path needs to remain visible.

## Files And Components
- `src/main/data/session-files.ts`
- `src/main/data/explorer.ts`
- `src/renderer/components/Sidebar.ts`
- `src/renderer/components/TreeView.ts`
- `src/renderer/styles.css`
- `tests/unit/data-access.test.ts`

## Verification Plan
- Add a regression test that loads sessions without project mappings and ensures they group by `workspace.yaml.cwd`.
- Run `bun test`.
- Run `bun run build`.

## Implementation Summary
- Added a `workspacePath` field to session records by reading each session directory’s `workspace.yaml`.
- Fallback grouped unmapped sessions by `workspace.yaml.cwd` instead of collapsing them into the single `Unknown` bucket.
- Updated the sidebar to show it is grouped by workspace directory and to display the directory path in each project card.
- Added a regression test that verifies two unmapped sessions with the same workspace directory group together.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Locally fixed. Sessions without project mappings now group by their workspace directory.

## Next Step
Ask the user to confirm the sidebar now groups sessions by directory as expected.

## Remaining Gaps
- Need to confirm the fallback directory label is the right one for users who have multiple workspace roots with the same basename.
