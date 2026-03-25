# Bug Description

## Title
Copilot session explorer shows raw event JSON instead of chat messages

## Status
- fixed

## Reported Symptoms
- The selected session transcript panel shows raw JSON event records.
- The content starts with entries like `session.start`, `session.mode_changed`, and `tool.execution_start`.
- The display is not a readable chat transcript.
- The left sidebar and transcript pane share scrolling behavior.
- Scrolling the transcript should not move the left sidebar.
- Sessions in the left sidebar are collapsed into a single project group when the project mapping is missing.
- The sidebar became visually cluttered after showing the full workspace directory in each group header.
- The project-level fallback to workspace directory grouping made the sidebar structure look wrong.
- The sidebar still shows an `Unknown` group, and the actual projects appear underneath it.
- The sidebar still reads like grouped cards instead of a clear tree with project roots and session leaves.

## Expected Behavior
- Show only `user.message` and `assistant.message` entries.
- Render them in a chat-like layout.
- Show each message timestamp alongside the message.
- Give the sidebar its own scroll area.
- Give the transcript its own independent scroll area.
- Group sidebar sessions by their workspace directory when project metadata is unavailable.
- Keep the visible sidebar compact while still preserving the directory information.
- Keep project buckets intact and group sessions by directory within each project.
- Promote fallback groups to the top level instead of nesting them under `Unknown`.
- Render an obvious tree where projects are roots and sessions are leaf nodes.

## Actual Behavior
- The parser exposes the full event stream as message content.
- Non-chat events are visible in the transcript.
- The sidebar does not have an isolated scrollbar.
- The transcript pane does not have an isolated scrollbar.
- Unmapped sessions are grouped under a single `Unknown` bucket instead of by directory.
- The sidebar headers became too tall and noisy when the full workspace path was rendered inline.
- Grouping by workspace directory at the project level broke the sidebar organization.
- The `Unknown` bucket remains in the tree and the real project groups are nested below it.
- The hierarchy is still too subtle visually, so it does not read as a tree.

## Reproduction Details
1. Launch the app.
2. Select a session that has an `events.jsonl` transcript.
3. Observe the main panel.

## Affected Area
- Session parsing in `src/main/data/parser.ts`.
- Transcript rendering in `src/renderer/components/ChatWindow.ts`.
- Layout and scrolling in `src/renderer/styles.css`.
- Sidebar grouping in `src/main/data/explorer.ts` and `src/main/data/session-files.ts`.
- Sidebar header rendering in `src/renderer/components/TreeView.ts`.
- Session directory grouping within the tree view.
- Top-level project derivation for unmapped sessions.
- Tree layout and connector styling in `src/renderer/components/TreeView.ts` and `src/renderer/styles.css`.

## Constraints
- Keep the app read-only.
- Preserve timestamps for displayed chat messages.

## Open Questions
- Should assistant messages with no textual content be omitted or rendered as empty bubbles?
- Should the sidebar keep its header visible while the tree scrolls, or should the entire sidebar scroll as one region?
- Is `workspace.yaml.cwd` the preferred directory label for grouping when the session store has no mapping?
- Should the full workspace path stay in a tooltip only, or should it appear in a secondary detail view?
- Should directory grouping happen only inside each project card, rather than changing the project buckets themselves?
- Should unmapped sessions become top-level project cards instead of staying under `Unknown`?
- What visual treatment should make the tree hierarchy obvious without adding clutter?
