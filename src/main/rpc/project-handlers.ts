import type { Project } from "../../common/types";
import { loadExplorerState, type ExplorerOptions } from "../data/explorer";

export async function getAllProjects(options: ExplorerOptions = {}): Promise<Project[]> {
  const state = await loadExplorerState(options);
  return state.projects;
}
