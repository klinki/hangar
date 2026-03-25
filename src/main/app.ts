import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllProjects } from "./rpc/project-handlers";
import { getSessionHistory } from "./rpc/session-handlers";

export interface AppOptions {
  port?: number;
  homeDir?: string;
  openBrowser?: boolean;
}

export async function startApp(options: AppOptions = {}): Promise<{ port: number; stop: () => void }> {
  const rootDir = process.cwd();
  const distDir = join(rootDir, "dist");
  await ensureRendererBundle(distDir, rootDir);

  const port = options.port ?? 3000;
  const server = Bun.serve({
    port,
    fetch: async (request) => handleRequest(request, { homeDir: options.homeDir, distDir, rootDir }),
  });

  if (options.openBrowser !== false) {
    void openBrowser(`http://127.0.0.1:${server.port}`);
  }

  console.log(`Copilot Session Explorer running at http://127.0.0.1:${server.port}`);

  return {
    port: server.port,
    stop: () => server.stop(),
  };
}

async function handleRequest(request: Request, context: { homeDir?: string; distDir: string; rootDir: string }): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return htmlResponse(await loadIndexHtml(context.rootDir));
  }

  if (url.pathname === "/index.js") {
    return fileResponse(join(context.distDir, "index.js"), "application/javascript; charset=utf-8");
  }

  if (url.pathname === "/styles.css") {
    return fileResponse(join(context.rootDir, "src/renderer/styles.css"), "text/css; charset=utf-8");
  }

  if (url.pathname === "/api/projects") {
    const projects = await getAllProjects({ homeDir: context.homeDir });
    return jsonResponse(projects);
  }

  if (url.pathname.startsWith("/api/sessions/")) {
    const sessionId = decodeURIComponent(url.pathname.slice("/api/sessions/".length));
    const session = await getSessionHistory(sessionId, { homeDir: context.homeDir });
    if (!session) {
      return jsonResponse({ message: `Session ${sessionId} was not found.`, code: "session_not_found" }, 404);
    }

    return jsonResponse(session);
  }

  return jsonResponse({ message: "Not found", code: "not_found" }, 404);
}

async function ensureRendererBundle(distDir: string, rootDir: string): Promise<void> {
  const bundlePath = join(distDir, "index.js");
  if (existsSync(bundlePath)) {
    return;
  }

  const buildResult = await Bun.build({
    entrypoints: [join(rootDir, "src/renderer/index.ts")],
    outdir: distDir,
    target: "browser",
    format: "esm",
    minify: false,
    sourcemap: "external",
  });

  if (!buildResult.success) {
    const firstError = buildResult.logs[0]?.message ?? "Unable to build renderer bundle.";
    throw new Error(firstError);
  }
}

async function loadIndexHtml(rootDir: string): Promise<string> {
  return readFile(join(rootDir, "src/renderer/index.html"), "utf8");
}

async function fileResponse(path: string, contentType: string): Promise<Response> {
  if (!existsSync(path)) {
    return jsonResponse({ message: `Missing asset: ${path}`, code: "asset_missing" }, 500);
  }

  const file = Bun.file(path);
  return new Response(file, {
    headers: {
      "content-type": contentType,
    },
  });
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  const command = platform === "win32" ? "cmd" : platform === "darwin" ? "open" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = Bun.spawn([command, ...args], {
    stdio: "ignore",
  });
  await child.exited.catch(() => undefined);
}

if (import.meta.main) {
  await startApp();
}
