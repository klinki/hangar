import { createHash } from "node:crypto";
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
    const projectPath = mapping?.projectPath ?? record.workspacePath ?? "";
    const projectName = mapping?.projectName ?? resolveProjectName(projectPath);
    const projectId = mapping?.projectId ?? resolveProjectId(projectPath, projectName);

    const session = parseSessionContent(record.rawContent, {
      sessionId: record.sessionId,
      projectId,
      rawPath: record.rawPath,
      modifiedAt: record.modifiedAt,
      workspacePath: record.workspacePath ?? projectPath,
    });

    if (!hasMeaningfulMessages(session)) {
      continue;
    }

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
  const projectPath = mapping?.projectPath ?? record.workspacePath ?? "";
  const projectName = mapping?.projectName ?? resolveProjectName(projectPath);
  const projectId = mapping?.projectId ?? resolveProjectId(projectPath, projectName);

  const session = parseSessionContent(record.rawContent, {
    sessionId,
    projectId,
    rawPath: record.rawPath,
    modifiedAt: record.modifiedAt,
    workspacePath: record.workspacePath ?? projectPath,
  });

  return hasMeaningfulMessages(session) ? session : undefined;
}

function resolveCopilotRoot(explicitHomeDir: string | undefined): string {
  const homeDir = explicitHomeDir ?? homedir();
  return join(homeDir, COPILOT_HOME_DIRECTORY);
}

function resolveProjectId(projectPath: string, projectName: string): string {
  if (projectPath || projectName) {
    return createHash("sha1").update(projectPath || projectName).digest("hex");
  }

  return UNKNOWN_PROJECT_ID;
}

function resolveProjectName(projectPath: string): string {
  if (!projectPath) {
    return UNKNOWN_PROJECT_NAME;
  }

  const normalizedPath = projectPath.replace(/\\/g, "/").replace(/\/+$/g, "");
  const parts = normalizedPath.split("/").filter(Boolean);
  return parts.at(-1) ?? UNKNOWN_PROJECT_NAME;
}

function hasMeaningfulMessages(session: Session): boolean {
  return session.messages.length > 0;
}
