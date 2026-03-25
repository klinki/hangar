import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const rootDir = process.cwd();
const rendererDistDir = join(rootDir, "dist", "renderer");
const mainDistDir = join(rootDir, "dist", "main");

await mkdir(rendererDistDir, { recursive: true });
await mkdir(mainDistDir, { recursive: true });

const rendererBuild = await Bun.build({
  entrypoints: [join(rootDir, "src/renderer/index.ts")],
  outdir: rendererDistDir,
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
  outdir: mainDistDir,
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
