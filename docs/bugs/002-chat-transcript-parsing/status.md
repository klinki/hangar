# Bug Status

## Current State
Fixed

## Active Attempt
Attempt 008: render the sidebar as an explicit project-root/session-leaf tree

## Last Updated
2026-03-25

## Confirmation Date
2026-03-25

## Resolution Summary
The sidebar was reworked into a tree structure with projects as root nodes and sessions as leaf nodes. The transcript parser already extracted chat messages correctly, and the final sidebar pass made the hierarchy visually clear in the desktop app. The user confirmed the result on 2026-03-25.

## Attempt History
- 2026-03-25: Bug workspace created for raw JSON transcript rendering.
- 2026-03-25: Investigation confirmed the source data is `events.jsonl` with user, assistant, and tool events.
- 2026-03-25: Attempt 001 started to parse JSONL events into chat messages and preserve timestamps.
- 2026-03-25: Attempt 001 verified locally with unit tests and build output.
- 2026-03-25: User reported that the sidebar and transcript pane need independent scrollbars.
- 2026-03-25: Attempt 002 started to isolate the sidebar tree and transcript panel scrolling.
- 2026-03-25: Attempt 002 verified locally with the renderer build.
- 2026-03-25: User reported that sessions in the left sidebar should be grouped by their directory.
- 2026-03-25: Attempt 003 started to group sessions by workspace directory when project metadata is missing.
- 2026-03-25: Attempt 003 verified locally with unit tests and the build.
- 2026-03-25: User reported that the sidebar became visually broken after showing the full workspace path inline.
- 2026-03-25: Attempt 004 started to preserve grouping while restoring a compact sidebar header layout.
- 2026-03-25: User reported that the sidebar was still broken after the project-level workspace fallback.
- 2026-03-25: Attempt 005 started to move directory grouping inside each project card instead of changing project buckets.
- 2026-03-25: Attempt 005 verified locally with unit tests and the build.
- 2026-03-25: User reported that the left sidebar still had no visible scrollbar.
- 2026-03-25: Attempt 006 started to force visible scrollbars on the sidebar and transcript panes.
- 2026-03-25: User reported that the sidebar still shows an `Unknown` group with real projects nested underneath it.
- 2026-03-25: Attempt 007 started to promote fallback groups to the top level.
- 2026-03-25: Attempt 007 verified locally with unit tests and the build.
- 2026-03-25: User reported that the sidebar still reads like grouped cards instead of a clear tree.
- 2026-03-25: Attempt 008 started to render the sidebar as an explicit root/leaf tree.
- 2026-03-25: Attempt 008 verified locally with unit tests and the build.
- 2026-03-25: User confirmed the tree-style sidebar is now fixed.

## State Change Log
- Opened after the user reported the transcript panel was showing raw JSON event records.
- Awaiting confirmation that the chat transcript now shows only user and assistant messages in the desktop app.

## Notes
- The prior blank-window bug remains fixed in `001-electrobun-blank-window`.
- Attempt 001 remains locally fixed; this follow-up is focused on scroll isolation in the same screen.
- Waiting for user confirmation that the sidebar and transcript now scroll independently in the app.
- Attempt 003 is expected to reuse `workspace.yaml.cwd` as the grouping key for unmapped sessions.
- Waiting for user confirmation that sidebar sessions now group by directory in the desktop app.
- Attempt 004 keeps the grouping logic but hides the full path from the primary header.
- Attempt 005 is expected to keep project buckets intact and only group session rows by workspace directory within each project.
- Waiting for user confirmation that the sidebar now shows projects at the top level and directory groups inside them.
- Attempt 006 is expected to force visible vertical scrollbars on the left sidebar and the transcript pane.
- Attempt 007 is expected to remove the `Unknown` bucket by deriving top-level project buckets from the workspace directory when no mapping exists.
- Waiting for user confirmation that the `Unknown` bucket is gone and the fallback projects are now top-level.
- Attempt 008 is expected to make the project/session hierarchy visually obvious with a root-and-leaf tree structure.
- Waiting for user confirmation that the sidebar now reads as a proper tree in the desktop app.
