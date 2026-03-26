# Bug Description

## Title
Filter empty sessions from the sidebar

## Status
- open

## Reported Symptoms
- Some sessions appear in the sidebar even though they contain no meaningful data.
- Example sessions reported by the user:
  - `f043c707-6c81-4c7d-b4f3-9a9d2ddb2579`
  - `9ee75713-c5c3-4153-96fc-2c9352e55ac1`

## Expected Behavior
- Sessions with no meaningful chat data should not appear in the sidebar.
- Only sessions that contain usable conversation content should be listed.

## Actual Behavior
- Empty or non-meaningful sessions are still being loaded into the project tree.

## Reproduction Details
1. Launch the app.
2. Inspect the sidebar session list.
3. Observe that some sessions with no useful content still appear.

## Affected Area
- Session loading in `src/main/data/explorer.ts`.
- Session parsing in `src/main/data/parser.ts`.
- Session list rendering in `src/renderer/components/TreeView.ts`.

## Constraints
- Keep the app read-only.
- Preserve valid sessions and their timestamps.

## Open Questions
- Should a session be considered empty when it has zero messages, or only when it has no non-empty user or assistant content?
