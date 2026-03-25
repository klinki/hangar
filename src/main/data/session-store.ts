import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { normalize } from "node:path";
import { Database } from "bun:sqlite";
import { UNKNOWN_PROJECT_ID, UNKNOWN_PROJECT_NAME } from "../../common/constants";
import type { ProjectMapping } from "../../common/types";

const sessionIdColumns = ["session_id", "sessionId", "id", "conversation_id", "conversationId"];
const projectIdColumns = ["project_id", "projectId"];
const projectNameColumns = ["workspace_name", "workspaceName", "project_name", "projectName", "name"];
const projectPathColumns = [
  "workspace_path",
  "workspacePath",
  "project_path",
  "projectPath",
  "path",
  "folder_path",
  "folderPath",
];

export async function loadProjectMappings(dbPath: string): Promise<ProjectMapping[]> {
  if (!existsSync(dbPath)) {
    return [];
  }

  const database = new Database(dbPath, { readonly: true, create: false });
  try {
    const tables = database
      .query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all();

    const mappings = new Map<string, ProjectMapping>();

    for (const table of tables) {
      const columns = database
        .query<{ name: string }>(`PRAGMA table_info(${quoteIdentifier(table.name)})`)
        .all()
        .map((column) => column.name);

      const sessionColumn = findColumn(columns, sessionIdColumns);
      if (!sessionColumn) {
        continue;
      }

      const projectIdColumn = findColumn(columns, projectIdColumns);
      const projectNameColumn = findColumn(columns, projectNameColumns);
      const projectPathColumn = findColumn(columns, projectPathColumns);

      if (!projectIdColumn && !projectNameColumn && !projectPathColumn) {
        continue;
      }

      const selectedColumns = [
        sessionColumn,
        projectIdColumn,
        projectNameColumn,
        projectPathColumn,
      ].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

      const rows = database
        .query<Record<string, unknown>>(
          `SELECT ${selectedColumns.map(quoteIdentifier).join(", ")} FROM ${quoteIdentifier(table.name)}`,
        )
        .all();

      for (const row of rows) {
        const sessionId = stringValue(row[sessionColumn]);
        if (!sessionId || mappings.has(sessionId)) {
          continue;
        }

        const projectPath = stringValue(projectPathColumn ? row[projectPathColumn] : undefined);
        const projectName = resolveProjectName(
          stringValue(projectNameColumn ? row[projectNameColumn] : undefined),
          projectPath,
        );
        const projectId = resolveProjectId(
          stringValue(projectIdColumn ? row[projectIdColumn] : undefined),
          projectPath,
          projectName,
        );

        mappings.set(sessionId, {
          sessionId,
          projectId,
          projectName,
          projectPath,
        });
      }
    }

    return [...mappings.values()];
  } finally {
    database.close();
  }
}

function findColumn(columns: string[], candidates: string[]): string | undefined {
  const normalizedColumns = new Map(columns.map((column) => [normalizeKey(column), column]));
  for (const candidate of candidates) {
    const exact = normalizedColumns.get(normalizeKey(candidate));
    if (exact) {
      return exact;
    }
  }
  return undefined;
}

function resolveProjectId(explicitId: string | undefined, projectPath: string, projectName: string): string {
  if (explicitId) {
    return explicitId;
  }

  const source = projectPath || projectName || UNKNOWN_PROJECT_ID;
  return createHash("sha1").update(source).digest("hex");
}

function resolveProjectName(explicitName: string | undefined, projectPath: string): string {
  if (explicitName) {
    return explicitName;
  }

  if (projectPath) {
    const normalizedPath = normalize(projectPath);
    const baseName = normalizedPath.split(/[\\/]/).filter(Boolean).pop();
    if (baseName) {
      return baseName;
    }
  }

  return UNKNOWN_PROJECT_NAME;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return undefined;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}
