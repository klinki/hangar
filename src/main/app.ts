import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { BrowserWindow, defineElectrobunRPC } from "electrobun/bun";
import type { ExplorerRPCSchema } from "../common/rpc";
import type { ExplorerState } from "../common/types";
import { loadExplorerState, loadSessionHistory } from "./data/explorer";

export interface AppOptions {
  homeDir?: string;
}

export async function startApp(options: AppOptions = {}): Promise<{ window: BrowserWindow; stop: () => void }> {
  const rootDir = process.cwd();
  const homeDir = options.homeDir ?? homedir();
  const rendererBundlePath = join(rootDir, "dist", "renderer", "index.js");

  await ensureRendererBundle(rootDir);
  const [rendererHtml, initialState] = await Promise.all([
    buildWindowHtml(rootDir, rendererBundlePath),
    loadExplorerState({ homeDir }),
  ]);

  let currentState: ExplorerState = initialState;

  const rpc = defineElectrobunRPC<ExplorerRPCSchema, "bun">("bun", {
    handlers: {
      requests: {
        async get_all_projects() {
          currentState = await loadExplorerState({ homeDir });
          rpc.send.update_tree(currentState.projects);
          return currentState.projects;
        },
        async get_session_history(sessionId: string) {
          const session = await loadSessionHistory(sessionId, { homeDir });
          if (!session) {
            const error = {
              message: `Session ${sessionId} was not found.`,
              code: "session_not_found",
            };
            rpc.send.error_reported(error);
            throw new Error(error.message);
          }

          rpc.send.session_loaded(session);
          return session;
        },
        async open_project_folder(projectId: string) {
          const project = currentState.projects.find((entry) => entry.id === projectId);
          if (!project?.path) {
            return;
          }

          await openPath(project.path);
        },
      },
      messages: {},
    },
  });

  const window = new BrowserWindow({
    title: "Copilot Session Explorer",
    frame: {
      x: 80,
      y: 60,
      width: 1440,
      height: 960,
    },
    html: rendererHtml,
    preload: null,
    viewsRoot: null,
    renderer: "native",
    rpc,
    titleBarStyle: "default",
    transparent: false,
    passthrough: false,
    hidden: false,
    navigationRules: null,
    sandbox: false,
  });

  rpc.send.update_tree(currentState.projects);

  return {
    window,
    stop: () => window.close(),
  };
}

async function ensureRendererBundle(rootDir: string): Promise<void> {
  const distDir = join(rootDir, "dist", "renderer");
  await Bun.build({
    entrypoints: [join(rootDir, "src/renderer/index.ts")],
    outdir: distDir,
    target: "browser",
    format: "esm",
    minify: false,
    sourcemap: "external",
  });
}

async function buildWindowHtml(rootDir: string, rendererBundlePath: string): Promise<string> {
  const [styles, script] = await Promise.all([
    readFile(join(rootDir, "src/renderer/styles.css"), "utf8"),
    readFile(rendererBundlePath, "utf8"),
  ]);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Copilot Session Explorer</title>
    <style>${styles}</style>
  </head>
  <body>
    <div id="app" class="app-shell">
      <main class="loading-state">Loading Copilot Session Explorer...</main>
    </div>
    <script type="module">${script}</script>
  </body>
</html>`;
}

async function openPath(path: string): Promise<void> {
  if (process.platform === "win32") {
    await Bun.spawn(["cmd", "/c", "start", "", path], { stdio: "ignore" }).exited.catch(() => undefined);
    return;
  }

  if (process.platform === "darwin") {
    await Bun.spawn(["open", path], { stdio: "ignore" }).exited.catch(() => undefined);
    return;
  }

  await Bun.spawn(["xdg-open", path], { stdio: "ignore" }).exited.catch(() => undefined);
}

if (import.meta.main) {
  await startApp();
}
