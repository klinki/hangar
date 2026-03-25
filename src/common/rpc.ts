import type { Project, Session } from "./types";

export interface ExplorerRPCSchema {
  bun: {
    requests: {
      get_all_projects: {
        response: Project[];
      };
      get_session_history: {
        params: string;
        response: Session | undefined;
      };
      open_project_folder: {
        params: string;
        response: void;
      };
    };
    messages: {
      update_tree: Project[];
      session_loaded: Session;
      error_reported: {
        message: string;
        code: string;
      };
    };
  };
  webview: {
    requests: Record<string, never>;
    messages: Record<string, never>;
  };
}
