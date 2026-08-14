// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

function copyServerEntryPlugin() {
  return {
    name: "lovable-copy-server-entry",
    apply: "build" as const,
    async closeBundle() {
      const src = resolve("dist/server/index.mjs");
      const dest = resolve("dist/server/server.js");
      try {
        await copyFile(src, dest);
      } catch {
        // ignore if the source file does not exist
      }
    },
  };
}

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  vite: {
    base: isGitHubPages ? "/lucas-cavalcante-portfolio/" : "/",
    plugins: [copyServerEntryPlugin()],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // GitHub Pages can only serve static files, so generate HTML for the portfolio routes.
    prerender: {
      enabled: true,
      autoSubfolderIndex: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      failOnError: true,
    },
  },
});
