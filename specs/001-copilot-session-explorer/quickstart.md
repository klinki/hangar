# Quickstart: Copilot Session Explorer

## Prerequisites
- **Bun**: v1.0+ (required for the main process and tests)
- **GitHub Copilot CLI**: Logged in and active (to generate session data)

## Setup
1. **Install dependencies**:
   ```bash
   bun install
   ```
2. **Run tests**:
   ```bash
   bun test
   ```
3. **Launch the app**:
   ```bash
   bun run dev
   ```
4. **Build the browser and main bundles**:
   ```bash
   bun run build
   ```

## What the app does
- Reads session data from `~/.copilot/session-state/`.
- Groups sessions by workspace metadata from `~/.copilot/session-store.db`.
- Shows projects and sessions in the left tree.
- Shows the selected session transcript in the main panel.

## Local Verification (Manual)
1. Ensure you have sessions in `~/.copilot/session-state/`.
2. Launch the app using `bun run dev`.
3. Open the browser at the printed local URL if it does not open automatically.
4. Verify the left sidepanel lists your projects.
5. Expand a project and click a session.
6. Confirm the main window displays the read-only chat history.

## Troubleshooting
- **No data shown**: Check whether `~/.copilot` exists and contains session files.
- **SQLite Error**: Ensure the Bun process has read access to `~/.copilot/session-store.db`.
- **Malformed session data**: The app skips unreadable records and falls back to an empty or partial view.
