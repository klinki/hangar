# Fix Attempt 004

## Attempt Status
In progress

## Goal
Keep sidebar grouping by workspace directory, but render the visible sidebar in a compact layout again.

## Relation To Previous Attempts
Follow-up after Attempt 003 correctly grouped sessions by directory but the inline full-path display made the sidebar too tall and noisy.

## Proposed Change
- Remove the inline full workspace path from the project header.
- Keep the workspace path available via a tooltip.
- Tighten the session row layout so the title and timestamp stay on one line.

## Risks
- Hiding the path from the header may make the grouping less explicit, so the tooltip needs to preserve that context.

## Files And Components
- `src/renderer/components/TreeView.ts`
- `src/renderer/styles.css`

## Verification Plan
- Run `bun run build`.
- Confirm the sidebar stays compact and the session groups remain visible.

## Implementation Summary
- Restored the original compact project header layout.
- Kept the workspace directory in the tooltip instead of rendering it inline.
- Added truncation and spacing rules to session rows so titles remain readable.

## Test Results

## Outcome

## Next Step
Verify the sidebar visually in the running app and confirm the compact layout looks correct.

## Remaining Gaps
- Need live confirmation that the tooltip-only path display is sufficient for disambiguation.
