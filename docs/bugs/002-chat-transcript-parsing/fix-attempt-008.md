# Fix Attempt 008

## Attempt Status
Fixed

## Goal
Render the left sidebar as an unmistakable tree: projects are roots and sessions are leaf nodes.

## Relation To Previous Attempts
Follow-up after Attempt 007 fixed the fallback grouping but the sidebar still looked too much like grouped cards.

## Proposed Change
- Replace the card-like project stack with a tree-style branch layout.
- Render each project as a visible root node with an expansion toggle.
- Render each session as an indented leaf row beneath its project.
- Add connector lines and node markers so the hierarchy is obvious.

## Risks
- A stronger tree presentation could take more horizontal space, so the layout needs to stay compact.
- If the styling is too subtle, the result will still look like a list instead of a tree.

## Files And Components
- `src/renderer/components/Sidebar.ts`
- `src/renderer/components/TreeView.ts`
- `src/renderer/styles.css`

## Verification Plan
- Run `bun test`.
- Run `bun run build`.
- Verify the sidebar reads visually as a tree with root project rows and leaf session rows.

## Implementation Summary
- Replaced the card-like sidebar presentation with a tree-style branch layout.
- Rendered projects as root nodes and sessions as indented leaf rows.
- Added connector lines, node markers, and clearer hierarchy styling.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Fixed. The sidebar now reads as an explicit tree with projects as roots and sessions as leaves, and the user confirmed the result.

## Next Step
None.

## Remaining Gaps
- Need user confirmation that the visual hierarchy is now obvious enough to count as a tree.
