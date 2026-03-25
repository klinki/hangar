# Fix Attempt 005

## Attempt Status
Fixed locally, awaiting user confirmation

## Goal
Keep project buckets intact and group session rows by workspace directory inside each project card.

## Relation To Previous Attempts
Follow-up after Attempt 004 showed that moving workspace fallback into the project layer broke the sidebar organization.

## Proposed Change
- Revert project grouping to use the existing project mapping only.
- Preserve each session’s workspace directory as metadata on the session itself.
- Render directory group headers inside each expanded project card.
- Keep the full directory path available as a tooltip, while showing a compact basename label in the tree.

## Risks
- The tree view gains a nested structure, so the spacing and indentation must stay compact.
- If a project contains only one directory group, the extra label should still read naturally.

## Files And Components
- `src/common/types.ts`
- `src/main/data/parser.ts`
- `src/main/data/explorer.ts`
- `src/main/data/session-files.ts`
- `src/renderer/components/TreeView.ts`
- `src/renderer/styles.css`
- `tests/unit/data-access.test.ts`

## Verification Plan
- Run `bun test`.
- Run `bun run build`.
- Confirm the sidebar still shows projects at the top level and groups sessions by directory inside them.

## Implementation Summary
- Restored the original project-level grouping behavior in `loadExplorerState`.
- Added `workspacePath` to session records so the UI can group session rows by directory without changing project buckets.
- Rendered compact directory group headers inside each expanded project card.
- Kept the full directory path on the group header tooltip rather than inline in the list.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Locally fixed. The sidebar should now keep project buckets intact while grouping session rows by directory inside each project.

## Next Step
Ask the user to confirm the sidebar looks correct again.

## Remaining Gaps
- Need live confirmation that the compact directory headers are enough for the user to understand the grouping.
