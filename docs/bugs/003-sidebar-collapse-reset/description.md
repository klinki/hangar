# Bug Description

## Title
Sidebar project collapse resets on refresh

## Status
- open

## Reported Symptoms
- Clicking a project header sometimes does not keep the project collapsed.
- Some project roots reopen after the sidebar refreshes.
- Single-session projects appear to stay open even when the user tries to collapse them.

## Expected Behavior
- Project roots should collapse and expand reliably.
- A manual collapse should stay collapsed until the user expands that project again.
- No project should be force-opened just because it has one session.

## Actual Behavior
- The selected project can be re-expanded by sidebar state refreshes.
- Projects with only one session cannot be collapsed at all.

## Reproduction Details
1. Open the app.
2. Select a session inside a project.
3. Click the project header to collapse it.
4. Observe that the project may reopen after the sidebar updates, or that single-session projects remain expanded.

## Affected Area
- Sidebar tree state in `src/renderer/components/TreeView.ts`.
- Sidebar refresh path in `src/renderer/index.ts`.

## Constraints
- Keep the app read-only.
- Preserve selection highlighting for the active session.

## Open Questions
- Should the sidebar auto-expand the selected project only on the first selection change, or never override a manual collapse?
- Should single-session projects ever be auto-expanded by default?
