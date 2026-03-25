export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export interface Session {
  id: string;
  projectId: string;
  timestamp: string;
  title: string;
  rawPath: string;
  messages: Message[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  sessions: Session[];
}

export interface ProjectMapping {
  sessionId: string;
  projectId: string;
  projectName: string;
  projectPath: string;
}

export interface ExplorerState {
  projects: Project[];
  sessionsById: Map<string, Session>;
}
