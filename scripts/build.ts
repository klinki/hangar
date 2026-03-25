import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");

await mkdir(distDir, { recursive: true });

const rendererBuild = await Bun.build({
  entrypoints: [join(rootDir, "src/renderer/index.ts")],
  outdir: distDir,
  target: "browser",
  format: "esm",
  minify: false,
  sourcemap: "external",
});

if (!rendererBuild.success) {
  for (const message of rendererBuild.logs) {
    console.error(message.message);
  }
  process.exit(1);
}

const mainBuild = await Bun.build({
  entrypoints: [join(rootDir, "src/main/app.ts")],
  outdir: join(distDir, "main"),
  target: "bun",
  format: "esm",
  minify: false,
  sourcemap: "external",
});

if (!mainBuild.success) {
  for (const message of mainBuild.logs) {
    console.error(message.message);
  }
  process.exit(1);
}

console.log("Build completed.");
