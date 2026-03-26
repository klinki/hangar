# Fix Attempt 001

## Attempt Status
Awaiting user confirmation

## Goal
Make project collapse state stable so manual collapses persist and every project root can actually collapse.

## Relation To Previous Attempts
New bug workspace for the collapse regression in the sidebar tree.

## Proposed Change
- Stop forcing single-session projects to remain expanded.
- Only auto-expand the selected project when the selection actually changes, not on every sidebar refresh.
- Keep the user-controlled collapsed state as the default source of truth after a manual toggle.

## Risks
- The selected project may not auto-open again if the same session is re-selected.
- Removing single-session auto-open could make the tree slightly denser, but that is preferable to broken collapse behavior.

## Files And Components
- `src/renderer/components/TreeView.ts`
- `src/renderer/index.ts` if selection refresh behavior needs to be adjusted
- `tests/unit/tree-view-state.test.ts` if a pure state regression test is added

## Verification Plan
- Run `bun test`.
- Run `bun run build`.
- Manually confirm that a project can collapse and stay collapsed after sidebar refreshes.

## Implementation Summary
- Updated `TreeView.setProjects` to preserve manual collapse state across refreshes instead of re-expanding the selected project every time.
- Removed the single-session auto-open rule so every project root can collapse.
- Added a pure `reconcileExpandedProjectIds` helper and regression tests for collapse persistence.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Fixed locally. Waiting for the user to confirm the collapse behavior in the app.

## Next Step
Ask the user to verify that project collapse now sticks after refreshes.

## Remaining Gaps
- Need manual confirmation in the desktop app.
