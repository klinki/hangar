# Bug Status

## Current State
Awaiting user confirmation

## Active Attempt
Attempt 002: isolate sidebar and transcript scroll areas

## Last Updated
2026-03-25

## Confirmation Date

## Resolution Summary

## Attempt History
- 2026-03-25: Bug workspace created for raw JSON transcript rendering.
- 2026-03-25: Investigation confirmed the source data is `events.jsonl` with user, assistant, and tool events.
- 2026-03-25: Attempt 001 started to parse JSONL events into chat messages and preserve timestamps.
- 2026-03-25: Attempt 001 verified locally with unit tests and build output.
- 2026-03-25: User reported that the sidebar and transcript pane need independent scrollbars.
- 2026-03-25: Attempt 002 started to isolate the sidebar tree and transcript panel scrolling.
- 2026-03-25: Attempt 002 verified locally with the renderer build.

## State Change Log
- Opened after the user reported the transcript panel was showing raw JSON event records.
- Awaiting confirmation that the chat transcript now shows only user and assistant messages in the desktop app.

## Notes
- The prior blank-window bug remains fixed in `001-electrobun-blank-window`.
- Attempt 001 remains locally fixed; this follow-up is focused on scroll isolation in the same screen.
- Waiting for user confirmation that the sidebar and transcript now scroll independently in the app.
