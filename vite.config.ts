import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";

function mockStatusTimestamp(): Plugin {
  return {
    name: "mock-status-timestamp",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== "/status.mock.json") {
          next();
          return;
        }

        const file = resolve(process.cwd(), "public/status.mock.json");
        const payload = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
        payload.updated_at = new Date().toISOString();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(payload));
      });
    },
  };
}

function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    closeBundle() {
      const index = resolve(process.cwd(), "dist/index.html");
      if (existsSync(index)) {
        copyFileSync(index, resolve(process.cwd(), "dist/404.html"));
      }
    },
  };
}

export default defineConfig({
  // Relative URLs work at https://d0raka.github.io/d0rz/ and later at d0rz.is-a.dev.
  base: "./",
  plugins: [mockStatusTimestamp(), spaFallback()],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4174,
  },
  test: {
    environment: "node",
  },
});
