# Initial Findings

- The Electrobun app launches, but the window is blank.
- The build output shows the renderer JS is generated at `Resources/app/views/renderer/index.js`.
- The copied HTML/CSS assets were landing under `Resources/app/app/views/...`, which does not match the window's `viewsRoot`.
- The app is loading `views://renderer/index.html`, so the view root must contain `renderer/index.html` and sibling assets in `Resources/app/views/renderer/`.
- Likely cause: the copy destination in `electrobun.config.ts` has one `app/` segment too many.

## Reproduction Status
- Reproduced locally from `bunx electrobun dev`.

## Evidence Gathered
- Build output under `build/dev-win-x64/CopilotSessionExplorer-dev/Resources/app/views/renderer/index.js`.
- Build output under `build/dev-win-x64/CopilotSessionExplorer-dev/Resources/app/app/views/renderer/index.html` and `styles.css`.
