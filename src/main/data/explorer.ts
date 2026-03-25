import { join } from "node:path";
import { homedir } from "node:os";
import {
  COPILOT_HOME_DIRECTORY,
  COPILOT_SESSION_STATE_DIRECTORY,
  COPILOT_SESSION_STORE_FILE,
  UNKNOWN_PROJECT_ID,
  UNKNOWN_PROJECT_NAME,
} from "../../common/constants";
import type { ExplorerState, Project, Session } from "../../common/types";
import { parseSessionContent } from "./parser";
import { listSessionFileRecords, loadSessionRecord } from "./session-files";
import { loadProjectMappings } from "./session-store";

export interface ExplorerOptions {
  homeDir?: string;
}

export async function loadExplorerState(options: ExplorerOptions = {}): Promise<ExplorerState> {
  const copilotRoot = resolveCopilotRoot(options.homeDir);
  const sessionStateDir = join(copilotRoot, COPILOT_SESSION_STATE_DIRECTORY);
  const sessionStorePath = join(copilotRoot, COPILOT_SESSION_STORE_FILE);

  const [records, mappings] = await Promise.all([listSessionFileRecords(sessionStateDir), loadProjectMappings(sessionStorePath)]);

  const mappingBySessionId = new Map(mappings.map((mapping) => [mapping.sessionId, mapping]));
  const projectsById = new Map<string, Project>();
  const sessionsById = new Map<string, Session>();

  for (const record of records) {
    const mapping = mappingBySessionId.get(record.sessionId);
    const projectId = mapping?.projectId ?? UNKNOWN_PROJECT_ID;
    const projectName = mapping?.projectName ?? UNKNOWN_PROJECT_NAME;
    const projectPath = mapping?.projectPath ?? "";

    const session = parseSessionContent(record.rawContent, {
      sessionId: record.sessionId,
      projectId,
      rawPath: record.rawPath,
      modifiedAt: record.modifiedAt,
    });

    sessionsById.set(session.id, session);

    const project = projectsById.get(projectId) ?? {
      id: projectId,
      name: projectName,
      path: projectPath,
      sessions: [],
    };

    project.sessions.push(session);
    projectsById.set(projectId, project);
  }

  const projects = [...projectsById.values()]
    .map((project) => ({
      ...project,
      sessions: project.sessions.sort((left, right) => right.timestamp.localeCompare(left.timestamp)),
    }))
    .sort((left, right) => {
      const byName = left.name.localeCompare(right.name);
      if (byName !== 0) {
        return byName;
      }

      return left.path.localeCompare(right.path);
    });

  return {
    projects,
    sessionsById,
  };
}

export async function loadSessionHistory(sessionId: string, options: ExplorerOptions = {}): Promise<Session | undefined> {
  const copilotRoot = resolveCopilotRoot(options.homeDir);
  const sessionStateDir = join(copilotRoot, COPILOT_SESSION_STATE_DIRECTORY);
  const sessionStorePath = join(copilotRoot, COPILOT_SESSION_STORE_FILE);

  const [record, mappings] = await Promise.all([loadSessionRecord(sessionStateDir, sessionId), loadProjectMappings(sessionStorePath)]);

  if (!record) {
    return undefined;
  }

  const mapping = mappings.find((entry) => entry.sessionId === sessionId);
  const projectId = mapping?.projectId ?? UNKNOWN_PROJECT_ID;

  return parseSessionContent(record.rawContent, {
    sessionId,
    projectId,
    rawPath: record.rawPath,
    modifiedAt: record.modifiedAt,
  });
}

function resolveCopilotRoot(explicitHomeDir: string | undefined): string {
  const homeDir = explicitHomeDir ?? homedir();
  return join(homeDir, COPILOT_HOME_DIRECTORY);
}
