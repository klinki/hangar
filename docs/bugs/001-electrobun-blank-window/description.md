# Bug Description

## Normalized Title
Blank Electrobun window after launch

## Status
Open

## Reported Symptoms
- `bun run dev` opens a window titled `Copilot Session Explorer`.
- The content area is blank/black.
- No project tree or session transcript is visible.

## Expected Behavior
- The native window should show the sidebar project tree and the session transcript panel.

## Actual Behavior
- The window opens but does not render the app UI.

## Reproduction Details
1. Run `bun run dev`.
2. Wait for the Electrobun window to open.
3. Observe a blank black content area.

## Affected Area
- Electrobun bootstrap and renderer asset loading.

## Constraints
- Must keep the app read-only.
- Must continue using Electrobun runtime and typed RPC.

## Open Questions
- Are the renderer assets copied to the exact path the window loads from?
