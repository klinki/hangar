# Fix Attempt 001

## Attempt Status
Awaiting user confirmation

## Goal
Filter out sessions that do not contain meaningful chat data so they do not appear in the sidebar.

## Relation To Previous Attempts
New bug workspace for the empty-session filtering issue.

## Proposed Change
- Add a session validity check after parsing and skip sessions whose `messages` array is empty.
- Apply the same filtering to `loadSessionHistory` so direct session loads remain consistent with the sidebar.
- Add regression coverage for empty-session filtering.

## Risks
- A session with only non-chat metadata will be hidden, which is the desired behavior for this bug but could hide edge cases if the definition of "meaningful" changes later.

## Files And Components
- `src/main/data/explorer.ts`
- `src/main/data/parser.ts`
- `src/main/data/session-files.ts` if any session metadata needs to be retained for filtering
- `tests/unit/data-access.test.ts`

## Verification Plan
- Run `bun test`.
- Run `bun run build`.
- Confirm the example empty sessions are no longer included in loaded project state.

## Implementation Summary
- Added a meaningful-message guard in `loadExplorerState` so sessions with no extracted chat messages are skipped before project assembly.
- Applied the same guard in `loadSessionHistory` so direct loads of empty sessions resolve to `undefined`.
- Tightened `parseSessionContent` so JSON payloads no longer fall back to raw text when they do not contain usable message content.
- Added regression coverage for empty-session filtering.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Fixed locally. Waiting for the user to confirm that the empty sessions are gone from the sidebar in the desktop app.

## Next Step
Ask the user to verify that the reported empty sessions no longer appear.

## Remaining Gaps
- Need manual confirmation in the desktop app.
