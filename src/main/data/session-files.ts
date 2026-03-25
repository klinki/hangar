import { readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const preferredExtensions = [".json", ".jsonl", ".ndjson", ".txt", ".md", ".log"];

export interface SessionFileRecord {
  sessionId: string;
  rawPath: string;
  rawContent: string;
  modifiedAt: string;
  workspacePath?: string;
}

export async function listSessionFileRecords(sessionStateDir: string): Promise<SessionFileRecord[]> {
  const rootStats = await safeStat(sessionStateDir);
  if (!rootStats?.isDirectory()) {
    return [];
  }

  const entries = await readdir(sessionStateDir, { withFileTypes: true });
  const records: SessionFileRecord[] = [];

  for (const entry of entries) {
    const entryPath = join(sessionStateDir, entry.name);
    const payloadPath = entry.isFile() ? entryPath : await findBestPayloadFile(entryPath);

    if (!payloadPath) {
      continue;
    }

    const rawContent = await Bun.file(payloadPath).text();
    if (!rawContent.trim()) {
      continue;
    }

    const payloadStats = await safeStat(payloadPath);
    records.push({
      sessionId: entry.isFile() ? deriveSessionId(entry.name, payloadPath) : entry.name,
      rawPath: payloadPath,
      rawContent,
      modifiedAt: (payloadStats?.mtime ?? rootStats.mtime).toISOString(),
      workspacePath: entry.isDirectory() ? await readWorkspacePath(entryPath) : undefined,
    });
  }

  return records;
}

export async function loadSessionRecord(
  sessionStateDir: string,
  sessionId: string,
): Promise<SessionFileRecord | undefined> {
  const records = await listSessionFileRecords(sessionStateDir);
  return records.find((record) => record.sessionId === sessionId);
}

async function findBestPayloadFile(rootPath: string, depth = 2): Promise<string | undefined> {
  const rootStats = await safeStat(rootPath);
  if (!rootStats?.isDirectory() || depth < 0) {
    return undefined;
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => join(rootPath, entry.name));
  const rankedFiles = files.sort((left, right) => rankPayloadFile(left) - rankPayloadFile(right));

  if (rankedFiles.length > 0) {
    return rankedFiles[0];
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const nested = await findBestPayloadFile(join(rootPath, entry.name), depth - 1);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function rankPayloadFile(filePath: string): number {
  const extension = extname(filePath).toLowerCase();
  const rank = preferredExtensions.indexOf(extension);
  return rank === -1 ? preferredExtensions.length : rank;
}

function deriveSessionId(entryName: string, payloadPath: string): string {
  const extension = extname(entryName);
  if (extension) {
    return entryName.slice(0, -extension.length);
  }

  const baseName = payloadPath.split(/[\\/]/).pop() ?? entryName;
  const nestedExtension = extname(baseName);
  return nestedExtension ? baseName.slice(0, -nestedExtension.length) : entryName;
}

async function safeStat(path: string): Promise<Awaited<ReturnType<typeof stat>> | undefined> {
  try {
    return await stat(path);
  } catch {
    return undefined;
  }
}

async function readWorkspacePath(sessionDir: string): Promise<string | undefined> {
  const workspaceYamlPath = join(sessionDir, "workspace.yaml");
  const rawContent = await readTextFile(workspaceYamlPath);
  if (!rawContent) {
    return undefined;
  }

  for (const line of rawContent.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:cwd|git_root)\s*:\s*(.+?)\s*$/i);
    if (!match) {
      continue;
    }

    const value = unquote(match[1].trim());
    if (value) {
      return value;
    }
  }

  return undefined;
}

async function readTextFile(path: string): Promise<string | undefined> {
  try {
    const content = await Bun.file(path).text();
    return content.trim() ? content : undefined;
  } catch {
    return undefined;
  }
}

function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1).trim();
    }
  }

  return value.trim();
}

