import { expect, test } from "bun:test";
import type { Project, Session } from "../../src/common/types";
import { reconcileExpandedProjectIds } from "../../src/renderer/components/TreeView";

test("reconcileExpandedProjectIds preserves manual collapse on refresh", () => {
  const projects = [makeProject("project-a", "session-a")];
  const collapsed = new Set<string>();

  const first = reconcileExpandedProjectIds(projects, "session-a", undefined, collapsed);
  expect(first.has("project-a")).toBe(true);

  const second = reconcileExpandedProjectIds(projects, "session-a", "session-a", new Set());
  expect(second.has("project-a")).toBe(false);
  expect(second.size).toBe(0);
});

test("reconcileExpandedProjectIds expands a project when selection changes", () => {
  const projects = [
    makeProject("project-a", "session-a"),
    makeProject("project-b", "session-b"),
  ];
  const collapsed = new Set<string>(["project-a"]);

  const next = reconcileExpandedProjectIds(projects, "session-b", "session-a", collapsed);
  expect(next.has("project-a")).toBe(true);
  expect(next.has("project-b")).toBe(true);
});

function makeProject(projectId: string, sessionId: string): Project {
  const session = makeSession(projectId, sessionId);
  return {
    id: projectId,
    name: projectId,
    path: `/workspaces/${projectId}`,
    sessions: [session],
  };
}

function makeSession(projectId: string, sessionId: string): Session {
  return {
    id: sessionId,
    projectId,
    timestamp: "2026-03-26T09:00:00.000Z",
    title: sessionId,
    rawPath: `${sessionId}.json`,
    messages: [],
  };
}
