# Fix Attempt 006

## Attempt Status
In progress

## Goal
Make the left sidebar and transcript panes show visible scrollbars again.

## Relation To Previous Attempts
Follow-up after Attempt 005 kept the sidebar structure correct but the vertical scrollbar still was not visible to the user.

## Proposed Change
- Force vertical scrolling on the sidebar tree and chat window with `overflow-y: scroll`.
- Reserve scrollbar gutter space so the scrollbar does not collapse into the content edge.
- Add visible dark-theme scrollbar styling for Chromium/Electrobun.

## Risks
- Always-visible scrollbars use a little extra width.
- Styling may differ slightly across platforms, but it should remain usable.

## Files And Components
- `src/renderer/styles.css`

## Verification Plan
- Run `bun run build`.
- Confirm the sidebar and transcript panes show visible scrollbars in the app.

## Implementation Summary

## Test Results

## Outcome

## Next Step
Verify the updated scrollbar styling in the desktop app.

## Remaining Gaps
- Need live confirmation that the scrollbar is visible in the left sidebar on the user’s machine.
