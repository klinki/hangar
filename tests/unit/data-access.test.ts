import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Database } from "bun:sqlite";
import { loadExplorerState } from "../../src/main/data/explorer";
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
