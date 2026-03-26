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
    this.root.setAttribute("role", "tree");
    this.root.addEventListener("click", (event) => this.handleClick(event));
  }

  mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.root);
    this.render();
    return this.root;
  }

  setProjects(projects: Project[], selectedSessionId?: string): void {
    const previousSelectedSessionId = this.selectedSessionId;
    this.projects = projects;
    this.selectedSessionId = selectedSessionId;
    this.expandedProjectIds = reconcileExpandedProjectIds(
      this.projects,
      this.selectedSessionId,
      previousSelectedSessionId,
      this.expandedProjectIds,
    );

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
      const branch = document.createElement("section");
      branch.className = "tree-branch";

      const projectHeader = document.createElement("button");
      projectHeader.type = "button";
      projectHeader.className = "tree-branch__toggle";
      projectHeader.dataset.projectToggle = "true";
      projectHeader.dataset.projectId = project.id;
      projectHeader.title = project.path ? `${project.name}\n${project.path}` : project.name;
      const isExpanded = this.expandedProjectIds.has(project.id);
      projectHeader.setAttribute("aria-expanded", String(isExpanded));
      projectHeader.setAttribute("aria-level", "1");
      projectHeader.setAttribute("role", "treeitem");
      projectHeader.innerHTML = `
        <span class="tree-branch__caret">▾</span>
        <span class="tree-branch__title">${escapeHtml(project.name)}</span>
        <span class="tree-branch__meta">${project.sessions.length} session${project.sessions.length === 1 ? "" : "s"}</span>
      `;

      branch.appendChild(projectHeader);

      if (isExpanded) {
        const sessionList = document.createElement("div");
        sessionList.className = "tree-branch__children";
        sessionList.setAttribute("role", "group");

        for (const session of project.sessions) {
          const sessionButton = document.createElement("button");
          sessionButton.type = "button";
          sessionButton.className = "tree-leaf";
          if (session.id === this.selectedSessionId) {
            sessionButton.classList.add("tree-leaf--active");
          }
          sessionButton.dataset.sessionId = session.id;
          sessionButton.setAttribute("aria-level", "2");
          sessionButton.setAttribute("role", "treeitem");
          sessionButton.setAttribute("aria-selected", String(session.id === this.selectedSessionId));
          sessionButton.title = session.rawPath ? `${session.title}\n${session.rawPath}` : session.title;
          sessionButton.innerHTML = `
            <span class="tree-leaf__title">${escapeHtml(session.title)}</span>
            <span class="tree-leaf__meta">${formatSessionTimestamp(session.timestamp)}</span>
          `;
          sessionList.appendChild(sessionButton);
        }

        branch.appendChild(sessionList);
      }

      this.root.appendChild(branch);
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

export function reconcileExpandedProjectIds(
  projects: Project[],
  selectedSessionId: string | undefined,
  previousSelectedSessionId: string | undefined,
  expandedProjectIds: Set<string>,
): Set<string> {
  if (!selectedSessionId || selectedSessionId === previousSelectedSessionId) {
    return expandedProjectIds;
  }

  const selectedProject = projects.find((project) =>
    project.sessions.some((session) => session.id === selectedSessionId),
  );

  if (!selectedProject) {
    return expandedProjectIds;
  }

  const nextExpandedProjectIds = new Set(expandedProjectIds);
  nextExpandedProjectIds.add(selectedProject.id);
  return nextExpandedProjectIds;
}

