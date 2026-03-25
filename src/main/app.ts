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
  const homeDir = options.homeDir ?? homedir();
  const viewsRoot = join(process.cwd(), "..", "Resources", "app", "views");
  const initialState = await loadExplorerState({ homeDir });

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
    url: "views://renderer/index.html",
    html: null,
    preload: null,
    viewsRoot,
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
