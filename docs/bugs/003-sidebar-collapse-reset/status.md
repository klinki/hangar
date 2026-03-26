# Bug Status

## Current State
Awaiting user confirmation

## Active Attempt
Attempt 001: make project collapse state user-driven

## Last Updated
2026-03-26

## Confirmation Date

## Resolution Summary
The collapse-state fix is implemented and verified locally. Manual collapse now survives sidebar refreshes, and project roots are no longer forced open just because they have one session. Waiting for the user to confirm the behavior in the desktop app.

## Attempt History
- 2026-03-26: Bug workspace created after the user reported inconsistent project collapse behavior in the sidebar tree.
- 2026-03-26: Investigation confirmed that selected-project re-expansion and single-session auto-open behavior can override manual collapse.
- 2026-03-26: Attempt 001 started to make project collapse state user-driven.
- 2026-03-26: Attempt 001 verified locally with `bun test` and `bun run build`.

## State Change Log
- 2026-03-26: bug opened
- 2026-03-26: investigation completed
- 2026-03-26: attempt 001 started
- 2026-03-26: verification finished
- 2026-03-26: awaiting user confirmation

## Notes
- The bug is a sidebar state issue in the same feature area as the session explorer.
- Manual collapse should survive sidebar refreshes.
