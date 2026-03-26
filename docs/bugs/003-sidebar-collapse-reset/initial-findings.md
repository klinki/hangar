# Initial Findings

## Confirmed Facts
- `TreeView.setProjects` stores the selected session id and then adds the selected project back into `expandedProjectIds` on every refresh.
- `TreeView.render` also forces `project.sessions.length === 1` roots to render as expanded.
- The collapse state is kept only in memory inside `expandedProjectIds`; there is no separate manual-collapse override.

## Likely Cause
- The sidebar treats the active selection and the user’s collapse intent as the same state.
- Any sidebar refresh can re-open the selected project, and single-session projects are never allowed to collapse.

## Unknowns
- Whether the desired behavior is to auto-expand only when the selected session changes.
- Whether single-session roots should collapse like every other project or stay open by default.

## Reproduction Status
- Reproduced by code inspection.
- Bun does not expose DOM globals in this workspace, so I am not using a component-level DOM test harness here.

## Evidence Gathered
- `src/renderer/components/TreeView.ts:26-33` re-adds the selected project to the expanded set on every `setProjects` call.
- `src/renderer/components/TreeView.ts:95` forces single-session projects open.
- `bun -e "console.log(typeof document, typeof window)"` returned `undefined undefined`, so direct DOM instantiation is not available in plain Bun scripts.
