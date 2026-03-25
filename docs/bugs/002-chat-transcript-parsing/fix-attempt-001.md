# Fix Attempt 001

## Attempt Status
Fixed locally, awaiting user confirmation

## Goal
Parse `events.jsonl` into a clean chat transcript that shows only `user.message` and `assistant.message` items with timestamps.

## Relation To Previous Attempts
First attempt for this bug.

## Proposed Change
- Add JSONL event parsing to `src/main/data/parser.ts`.
- Map `user.message` to `role: "user"` and `assistant.message` to `role: "assistant"`.
- Extract message text from event `data.content` and fall back to nearby text fields when needed.
- Preserve the event timestamp on each parsed message.
- Ignore non-chat events such as session, tool, and hook records.
- Add regression tests for JSONL parsing and timestamp retention.

## Risks
- Some assistant messages may have no textual content and need a policy decision.
- The session format may include additional structured variants beyond the sample inspected so far.

## Files And Components
- `src/main/data/parser.ts`
- `src/common/types.ts`
- `src/renderer/components/ChatWindow.ts`
- `tests/unit/data-access.test.ts`

## Verification Plan
- Add focused unit tests for `events.jsonl` parsing.
- Run `bun test`.
- Run the app against a sample session if needed to confirm the transcript renders as chat bubbles.

## Implementation Summary
- Added a JSONL parsing pass that walks each line, parses event records, and extracts only `user.message` and `assistant.message` items.
- Added an event-specific normalizer so non-chat records are ignored instead of being rendered as raw JSON.
- Added a regression test that mirrors a real session event stream and checks message text, roles, timestamps, and title derivation.

## Test Results
- `bun test` passed.
- `bun run build` passed.

## Outcome
- Locally fixed. The parser now reads JSONL event streams and the chat window receives only user and assistant turns with timestamps.

## Next Step
Ask the user to confirm the desktop app now renders a chat-like transcript instead of raw JSON.

## Remaining Gaps
- Need to confirm the desired treatment of empty assistant messages after parsing the real data shape.
