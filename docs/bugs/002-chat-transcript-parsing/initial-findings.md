# Initial Findings

## Confirmed Facts
- The active transcript source is a JSONL event stream, not a simple alternating chat log.
- Example event types include `session.start`, `session.mode_changed`, `user.message`, `assistant.message`, and tool/hook events.
- The current parser treats the event file as plain text when full JSON parsing fails.
- The chat window already knows how to display role and timestamp if the parsed message model contains them.

## Likely Cause
- `src/main/data/parser.ts` does not recognize `events.jsonl` records.
- It falls back to delimited-text parsing, so the entire raw event line becomes the displayed message content.

## Unknowns
- Whether every session transcript is stored as `events.jsonl` or whether some sessions use a different structured format.
- Whether any `assistant.message` entries should be skipped when they have no textual content.

## Reproduction Status
- Reproduced by inspecting a real `events.jsonl` sample from `.copilot/session-state`.

## Evidence Gathered
- Sample lines from `C:\\Users\\david\\.copilot\\session-state\\0172b43f-d781-4ea2-b47d-e0358a2ac853\\events.jsonl` include:
  - `session.start`
  - `user.message`
  - `assistant.message`
  - `tool.execution_start`
- The visible UI currently shows the raw JSON from those lines instead of just the user and assistant text.
