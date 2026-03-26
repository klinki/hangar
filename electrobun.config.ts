import type { ElectrobunConfig } from "electrobun/bun";
import packageJson from "./package.json";

const config: ElectrobunConfig = {
  app: {
    name: "Copilot Session Explorer",
    identifier: "com.codex.copilot-session-explorer",
    version: packageJson.version,
    description: "Read-only desktop explorer for GitHub Copilot session history",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {
      renderer: {
        entrypoint: "src/renderer/index.ts",
      },
    },
    copy: {
      "src/renderer/index.html": "views/renderer/index.html",
      "src/renderer/styles.css": "views/renderer/styles.css",
    },
    watch: ["src/bun/**", "src/main/**", "src/renderer/**", "src/common/**"],
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
};

export default config;

