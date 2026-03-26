# Initial Findings

## Confirmed Facts
- `loadExplorerState` currently adds every parsed session to the project tree.
- `parseSessionContent` returns a `Session` even when no meaningful messages are extracted.
- Empty sessions can therefore survive parsing and appear in the sidebar.

## Likely Cause
- There is no filtering step between parsing a session and inserting it into `projectsById`.

## Unknowns
- Whether the filter should be based strictly on `messages.length === 0` or on a broader definition of meaningful content.
- Whether `loadSessionHistory` should also return `undefined` for empty sessions.

## Reproduction Status
- Confirmed by code inspection.

## Evidence Gathered
- `src/main/data/explorer.ts` unconditionally pushes every parsed session into its project bucket.
- `src/main/data/parser.ts` can return sessions whose `messages` array is empty.
