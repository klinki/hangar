import { Electroview } from "electrobun/view";
import type { ExplorerRPCSchema } from "../common/rpc";
import type { Project, Session } from "../common/types";

const explorerRpc = Electroview.defineRPC<ExplorerRPCSchema>({
  handlers: {
    requests: {},
    messages: {},
  },
});

new Electroview({ rpc: explorerRpc });

export interface ExplorerClient {
  getAllProjects(): Promise<Project[]>;
  getSessionHistory(sessionId: string): Promise<Session | undefined>;
  openProjectFolder(projectId: string): Promise<void>;
}

export interface ExplorerEventHandlers {
  onTreeUpdate?(projects: Project[]): void;
  onSessionLoaded?(session: Session): void;
  onErrorReported?(error: { message: string; code: string }): void;
}

export function createExplorerClient(): ExplorerClient {
  return {
    async getAllProjects() {
      return explorerRpc.request.get_all_projects();
    },
    async getSessionHistory(sessionId: string) {
      return explorerRpc.request.get_session_history(sessionId);
    },
    async openProjectFolder(projectId: string) {
      await explorerRpc.request.open_project_folder(projectId);
    },
  };
}

export function subscribeToExplorerEvents(handlers: ExplorerEventHandlers): () => void {
  const disposers: Array<() => void> = [];

  if (handlers.onTreeUpdate) {
    const listener = (projects: Project[]) => handlers.onTreeUpdate?.(projects);
    explorerRpc.addMessageListener("update_tree", listener);
    disposers.push(() => explorerRpc.removeMessageListener("update_tree", listener));
  }

  if (handlers.onSessionLoaded) {
    const listener = (session: Session) => handlers.onSessionLoaded?.(session);
    explorerRpc.addMessageListener("session_loaded", listener);
    disposers.push(() => explorerRpc.removeMessageListener("session_loaded", listener));
  }

  if (handlers.onErrorReported) {
    const listener = (error: { message: string; code: string }) => handlers.onErrorReported?.(error);
    explorerRpc.addMessageListener("error_reported", listener);
    disposers.push(() => explorerRpc.removeMessageListener("error_reported", listener));
  }

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}
