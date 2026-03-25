import type { Project } from "../../common/types";

export interface TreeViewOptions {
  onSelectSession(sessionId: string): void;
}

export class TreeView {
  private readonly root: HTMLElement;
  private projects: Project[] = [];
  private expandedProjectIds = new Set<string>();
  private selectedSessionId: string | undefined;

  constructor(private readonly options: TreeViewOptions) {
    this.root = document.createElement("div");
    this.root.className = "tree-view";
    this.root.addEventListener("click", (event) => this.handleClick(event));
  }

  mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.root);
    this.render();
    return this.root;
  }

  setProjects(projects: Project[], selectedSessionId?: string): void {
    this.projects = projects;
    this.selectedSessionId = selectedSessionId;

    if (selectedSessionId) {
      const selectedProject = this.projects.find((project) => project.sessions.some((session) => session.id === selectedSessionId));
      if (selectedProject) {
        this.expandedProjectIds.add(selectedProject.id);
      }
    }

    this.render();
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const projectToggle = target.closest<HTMLButtonElement>("[data-project-toggle]");
    if (projectToggle) {
      const projectId = projectToggle.dataset.projectId;
      if (projectId) {
        this.toggleProject(projectId);
      }
      return;
    }

    const sessionButton = target.closest<HTMLButtonElement>("[data-session-id]");
    if (sessionButton) {
      const sessionId = sessionButton.dataset.sessionId;
      if (sessionId) {
        this.options.onSelectSession(sessionId);
      }
    }
  }

  private toggleProject(projectId: string): void {
    if (this.expandedProjectIds.has(projectId)) {
      this.expandedProjectIds.delete(projectId);
    } else {
      this.expandedProjectIds.add(projectId);
    }

    this.render();
  }

  private render(): void {
    this.root.replaceChildren();

    if (this.projects.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No Copilot sessions were found in this workspace.";
      this.root.appendChild(empty);
      return;
    }

    for (const project of this.projects) {
      const projectCard = document.createElement("section");
      projectCard.className = "tree-project";

      const projectHeader = document.createElement("button");
      projectHeader.type = "button";
      projectHeader.className = "tree-project__toggle";
      projectHeader.dataset.projectToggle = "true";
      projectHeader.dataset.projectId = project.id;
      const isExpanded = this.expandedProjectIds.has(project.id) || project.sessions.length === 1;
      projectHeader.setAttribute("aria-expanded", String(isExpanded));
      projectHeader.innerHTML = `
        <span>
          <span>${escapeHtml(project.name)}</span>
          <span class="tree-project__meta">${project.sessions.length} session${project.sessions.length === 1 ? "" : "s"}</span>
        </span>
        <span class="tree-project__caret">▾</span>
      `;

      projectCard.appendChild(projectHeader);

      if (isExpanded) {
        const sessionList = document.createElement("div");
        sessionList.className = "tree-project__sessions";

        for (const session of project.sessions) {
          const sessionButton = document.createElement("button");
          sessionButton.type = "button";
          sessionButton.className = "tree-session";
          if (session.id === this.selectedSessionId) {
            sessionButton.classList.add("tree-session--active");
          }
          sessionButton.dataset.sessionId = session.id;
          sessionButton.innerHTML = `
            <span>${escapeHtml(session.title)}</span>
            <span class="tree-project__meta">${formatSessionTimestamp(session.timestamp)}</span>
          `;
          sessionList.appendChild(sessionButton);
        }

        projectCard.appendChild(sessionList);
      }

      this.root.appendChild(projectCard);
    }
  }
}

function formatSessionTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

