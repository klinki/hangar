import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Database } from "bun:sqlite";
import { loadExplorerState } from "../../src/main/data/explorer";
import { loadSessionHistory } from "../../src/main/data/explorer";
import { parseSessionContent } from "../../src/main/data/parser";
import { listSessionFileRecords } from "../../src/main/data/session-files";
import { loadProjectMappings } from "../../src/main/data/session-store";

let tempRoot = "";

beforeEach(() => {
  tempRoot = mkdtempSync(join(tmpdir(), "copilot-session-explorer-"));
});

afterEach(() => {
  if (tempRoot) {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("listSessionFileRecords discovers top-level files and nested session payloads", async () => {
  const sessionStateDir = join(tempRoot, "session-state");
  mkdirSync(sessionStateDir, { recursive: true });
  writeFileSync(join(sessionStateDir, "alpha.json"), JSON.stringify({ messages: [{ role: "user", content: "hello" }] }), "utf8");

  const nestedDir = join(sessionStateDir, "beta");
  mkdirSync(nestedDir, { recursive: true });
  writeFileSync(join(nestedDir, "session.txt"), "User: alpha\nAssistant: beta", "utf8");

  const records = await listSessionFileRecords(sessionStateDir);
  expect(records.map((record) => record.sessionId).sort()).toEqual(["alpha", "beta"]);
});

test("loadProjectMappings reads session to workspace mappings from sqlite", async () => {
  const dbPath = join(tempRoot, "session-store.db");
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE session_projects (
      session_id TEXT NOT NULL,
      workspace_name TEXT NOT NULL,
      workspace_path TEXT NOT NULL
    );
  `);
  db.query("INSERT INTO session_projects (session_id, workspace_name, workspace_path) VALUES (?, ?, ?)").run(
    "alpha",
    "Explorer",
    join(tempRoot, "Explorer"),
  );
  db.close();

  const mappings = await loadProjectMappings(dbPath);
  expect(mappings).toHaveLength(1);
  expect(mappings[0].sessionId).toBe("alpha");
  expect(mappings[0].projectName).toBe("Explorer");
});

test("parseSessionContent handles structured JSON and plain text transcripts", () => {
  const structured = parseSessionContent(JSON.stringify({ messages: [{ role: "user", content: "Start" }, { role: "assistant", content: "Done" }] }), {
    sessionId: "alpha",
    projectId: "project-1",
    rawPath: "alpha.json",
    modifiedAt: "2026-03-25T12:00:00.000Z",
  });

  expect(structured.title).toBe("Start");
  expect(structured.messages).toHaveLength(2);

  const plain = parseSessionContent("User: Plan the change\nAssistant: Implemented it.", {
    sessionId: "beta",
    projectId: "project-1",
    rawPath: "beta.txt",
    modifiedAt: "2026-03-25T12:00:00.000Z",
  });

  expect(plain.messages).toHaveLength(2);
  expect(plain.messages[0].role).toBe("user");
  expect(plain.messages[1].role).toBe("assistant");
});

test("parseSessionContent extracts chat messages from JSONL event streams", () => {
  const jsonl = [
    JSON.stringify({
      type: "session.start",
      data: {
        sessionId: "gamma",
      },
      timestamp: "2026-03-25T09:00:00.000Z",
    }),
    JSON.stringify({
      type: "user.message",
      data: {
        content: "Please update the workflow.",
      },
      timestamp: "2026-03-25T09:01:00.000Z",
    }),
    JSON.stringify({
      type: "tool.execution_start",
      data: {
        toolName: "view",
      },
      timestamp: "2026-03-25T09:01:05.000Z",
    }),
    JSON.stringify({
      type: "assistant.message",
      data: {
        content: "I updated the workflow and kept the app read-only.",
      },
      timestamp: "2026-03-25T09:02:00.000Z",
    }),
  ].join("\n");

  const parsed = parseSessionContent(jsonl, {
    sessionId: "gamma",
    projectId: "project-1",
    rawPath: "events.jsonl",
    modifiedAt: "2026-03-25T12:00:00.000Z",
  });

  expect(parsed.title).toBe("Please update the workflow.");
  expect(parsed.messages).toHaveLength(2);
  expect(parsed.messages[0]).toEqual({
    role: "user",
    content: "Please update the workflow.",
    timestamp: "2026-03-25T09:01:00.000Z",
  });
  expect(parsed.messages[1]).toEqual({
    role: "assistant",
    content: "I updated the workflow and kept the app read-only.",
    timestamp: "2026-03-25T09:02:00.000Z",
  });
  expect(parsed.messages.map((message) => message.content)).not.toContainEqual(expect.stringContaining('"type":"tool.execution_start"'));
});

test("loadExplorerState groups sessions into projects and keeps read-only data", async () => {
  const copilotRoot = join(tempRoot, ".copilot");
  const sessionStateDir = join(copilotRoot, "session-state");
  mkdirSync(sessionStateDir, { recursive: true });

  writeFileSync(join(sessionStateDir, "alpha.json"), JSON.stringify({ messages: [{ role: "user", content: "Alpha prompt" }] }), "utf8");
  writeFileSync(join(sessionStateDir, "beta.json"), JSON.stringify({ messages: [{ role: "user", content: "Beta prompt" }] }), "utf8");

  const db = new Database(join(copilotRoot, "session-store.db"));
  db.exec(`
    CREATE TABLE session_projects (
      session_id TEXT NOT NULL,
      workspace_name TEXT NOT NULL,
      workspace_path TEXT NOT NULL
    );
  `);
  db.query("INSERT INTO session_projects (session_id, workspace_name, workspace_path) VALUES (?, ?, ?)").run(
    "alpha",
    "Workspace A",
    join(tempRoot, "Workspace A"),
  );
  db.query("INSERT INTO session_projects (session_id, workspace_name, workspace_path) VALUES (?, ?, ?)").run(
    "beta",
    "Workspace B",
    join(tempRoot, "Workspace B"),
  );
  db.close();

  const state = await loadExplorerState({ homeDir: tempRoot });
  expect(state.projects).toHaveLength(2);
  expect(state.projects[0].sessions[0].messages[0].content).toMatch(/prompt/i);
});

test("loadExplorerState groups unmapped sessions by workspace directory", async () => {
  const copilotRoot = join(tempRoot, ".copilot");
  const sessionStateDir = join(copilotRoot, "session-state");
  mkdirSync(sessionStateDir, { recursive: true });

  const sharedWorkspace = "E:\\projects\\emclient\\open-ai-api";
  const sessionA = join(sessionStateDir, "alpha-session");
  const sessionB = join(sessionStateDir, "beta-session");
  mkdirSync(sessionA, { recursive: true });
  mkdirSync(sessionB, { recursive: true });

  writeFileSync(
    join(sessionA, "events.jsonl"),
    JSON.stringify({ type: "user.message", data: { content: "Alpha prompt" }, timestamp: "2026-03-25T08:00:00.000Z" }),
    "utf8",
  );
  writeFileSync(
    join(sessionB, "events.jsonl"),
    JSON.stringify({ type: "user.message", data: { content: "Beta prompt" }, timestamp: "2026-03-25T09:00:00.000Z" }),
    "utf8",
  );
  writeFileSync(
    join(sessionA, "workspace.yaml"),
    [
      "id: alpha-session",
      `cwd: ${sharedWorkspace}`,
      `git_root: ${sharedWorkspace}`,
      "repository: emclient/open-ai-api",
      "branch: feature/alpha",
    ].join("\n"),
    "utf8",
  );
  writeFileSync(
    join(sessionB, "workspace.yaml"),
    [
      "id: beta-session",
      `cwd: ${sharedWorkspace}`,
      `git_root: ${sharedWorkspace}`,
      "repository: emclient/open-ai-api",
      "branch: feature/beta",
    ].join("\n"),
    "utf8",
  );

  const state = await loadExplorerState({ homeDir: tempRoot });
  expect(state.projects).toHaveLength(1);
  expect(state.projects[0].name).toBe("open-ai-api");
  expect(state.projects[0].path).toBe(sharedWorkspace);
  expect(state.projects[0].sessions).toHaveLength(2);
  expect(state.projects[0].sessions.map((session) => session.title).sort()).toEqual(["Alpha prompt", "Beta prompt"]);
  expect(state.projects[0].sessions.every((session) => session.workspacePath === sharedWorkspace)).toBe(true);
});

test("loadExplorerState filters sessions without meaningful messages", async () => {
  const copilotRoot = join(tempRoot, ".copilot");
  const sessionStateDir = join(copilotRoot, "session-state");
  mkdirSync(sessionStateDir, { recursive: true });

  const meaningfulId = "meaningful-session";
  const emptyId = "empty-session";

  writeFileSync(
    join(sessionStateDir, `${meaningfulId}.json`),
    JSON.stringify({ messages: [{ role: "user", content: "Keep me" }] }),
    "utf8",
  );
  writeFileSync(
    join(sessionStateDir, `${emptyId}.json`),
    JSON.stringify({ messages: [] }),
    "utf8",
  );

  const db = new Database(join(copilotRoot, "session-store.db"));
  db.exec(`
    CREATE TABLE session_projects (
      session_id TEXT NOT NULL,
      workspace_name TEXT NOT NULL,
      workspace_path TEXT NOT NULL
    );
  `);
  db.query("INSERT INTO session_projects (session_id, workspace_name, workspace_path) VALUES (?, ?, ?)").run(
    meaningfulId,
    "Workspace",
    join(tempRoot, "Workspace"),
  );
  db.query("INSERT INTO session_projects (session_id, workspace_name, workspace_path) VALUES (?, ?, ?)").run(
    emptyId,
    "Workspace",
    join(tempRoot, "Workspace"),
  );
  db.close();

  const state = await loadExplorerState({ homeDir: tempRoot });
  expect(state.sessionsById.has(meaningfulId)).toBe(true);
  expect(state.sessionsById.has(emptyId)).toBe(false);
  expect(state.projects).toHaveLength(1);
  expect(state.projects[0].sessions).toHaveLength(1);
  expect(state.projects[0].sessions[0].id).toBe(meaningfulId);

  const emptySession = await loadSessionHistory(emptyId, { homeDir: tempRoot });
  expect(emptySession).toBeUndefined();
});
