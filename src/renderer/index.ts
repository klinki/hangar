import type { Project, Session } from "../common/types";
import { createExplorerClient, subscribeToExplorerEvents } from "./api";
import { ChatWindow } from "./components/ChatWindow";
import { Sidebar } from "./components/Sidebar";

interface AppState {
  projects: Project[];
  selectedSession?: Session;
}

const client = createExplorerClient();
const appState: AppState = {
  projects: [],
};

bootstrap().catch((error) => {
  const root = document.getElementById("app");
  if (root) {
    root.replaceChildren();
    const message = document.createElement("div");
    message.className = "error-state";
    message.textContent = error instanceof Error ? error.message : "Unable to load the explorer.";
    root.appendChild(message);
  }
});

async function bootstrap(): Promise<void> {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("App root element was not found.");
  }

  root.replaceChildren();
  const workspace = document.createElement("div");
  workspace.className = "workspace";

  const mainPanel = document.createElement("main");
  mainPanel.className = "main-panel";

  const chatWindow = new ChatWindow();
  chatWindow.mount(mainPanel);

  const sidebar = new Sidebar({
    onSelectSession: async (sessionId) => {
      const session = await client.getSessionHistory(sessionId);
      if (!session) {
        chatWindow.setError(`Session ${sessionId} was not found.`);
        return;
      }

      applySessionSelection(session, sidebar, chatWindow);
    },
  });

  sidebar.mount(workspace);
  workspace.appendChild(mainPanel);
  root.appendChild(workspace);

  const dispose = subscribeToExplorerEvents({
    onTreeUpdate(projects) {
      appState.projects = projects;
      sidebar.setProjects(appState.projects, appState.selectedSession?.id);
      if (appState.projects.length === 0) {
        chatWindow.setError("No Copilot sessions were found. Check that ~/.copilot exists and contains session data.");
      }
    },
    onSessionLoaded(session) {
      applySessionSelection(session, sidebar, chatWindow);
    },
    onErrorReported(error) {
      chatWindow.setError(error.message);
    },
  });

  try {
    appState.projects = await client.getAllProjects();
    sidebar.setProjects(appState.projects, appState.selectedSession?.id);
    if (appState.projects.length === 0) {
      chatWindow.setError("No Copilot sessions were found. Check that ~/.copilot exists and contains session data.");
    }
  } catch (error) {
    chatWindow.setError(error instanceof Error ? error.message : "Unable to load session data.");
  }

  window.addEventListener("beforeunload", dispose, { once: true });
}

function applySessionSelection(session: Session, sidebar: Sidebar, chatWindow: ChatWindow): void {
  appState.selectedSession = session;
  sidebar.setProjects(appState.projects, session.id);
  chatWindow.setSession(session);
}
