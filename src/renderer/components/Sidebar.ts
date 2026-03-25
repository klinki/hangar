import type { Project } from "../../common/types";
import { TreeView } from "./TreeView";

export interface SidebarOptions {
  onSelectSession(sessionId: string): void;
}

export class Sidebar {
  private readonly root: HTMLElement;
  private readonly treeView: TreeView;

  constructor(options: SidebarOptions) {
    this.root = document.createElement("aside");
    this.root.className = "sidebar";

    const title = document.createElement("header");
    const heading = document.createElement("h1");
    heading.className = "sidebar__title";
    heading.textContent = "Copilot Session Explorer";

    const subtitle = document.createElement("p");
    subtitle.className = "sidebar__subtitle";
    subtitle.textContent = "Projects as roots, sessions as leaves, read-only from ~/.copilot";

    title.append(heading, subtitle);
    this.root.appendChild(title);

    this.treeView = new TreeView(options);
    this.treeView.mount(this.root);
  }

  mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.root);
    return this.root;
  }

  setProjects(projects: Project[], selectedSessionId?: string): void {
    this.treeView.setProjects(projects, selectedSessionId);
  }
}
