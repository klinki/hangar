import type { Project, Session } from "../common/types";

export interface ExplorerClient {
  getAllProjects(): Promise<Project[]>;
  getSessionHistory(sessionId: string): Promise<Session | undefined>;
}

export function createExplorerClient(): ExplorerClient {
  return {
    async getAllProjects() {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error(`Unable to load projects: ${response.status}`);
      }

      return (await response.json()) as Project[];
    },
    async getSessionHistory(sessionId: string) {
      const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`);
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error(`Unable to load session ${sessionId}: ${response.status}`);
      }

      return (await response.json()) as Session;
    },
  };
}
