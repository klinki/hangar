# Bug Description

## Title
Copilot session explorer shows raw event JSON instead of chat messages

## Status
- open

## Reported Symptoms
- The selected session transcript panel shows raw JSON event records.
- The content starts with entries like `session.start`, `session.mode_changed`, and `tool.execution_start`.
- The display is not a readable chat transcript.

## Expected Behavior
- Show only `user.message` and `assistant.message` entries.
- Render them in a chat-like layout.
- Show each message timestamp alongside the message.

## Actual Behavior
- The parser exposes the full event stream as message content.
- Non-chat events are visible in the transcript.

## Reproduction Details
1. Launch the app.
2. Select a session that has an `events.jsonl` transcript.
3. Observe the main panel.

## Affected Area
- Session parsing in `src/main/data/parser.ts`.
- Transcript rendering in `src/renderer/components/ChatWindow.ts`.

## Constraints
- Keep the app read-only.
- Preserve timestamps for displayed chat messages.

## Open Questions
- Should assistant messages with no textual content be omitted or rendered as empty bubbles?
