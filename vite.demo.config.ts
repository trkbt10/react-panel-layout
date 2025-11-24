/**
 * @file Vite build configuration for demo page
 */

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

/**
 * Extract repository name from package.json repository URL
 * Supports various GitHub URL formats:
 * - git+https://github.com/user/repo.git
 * - https://github.com/user/repo
 * - github:user/repo
 */
function getRepoName(): string {
  const repo = pkg.repository;
  if (!repo || typeof repo === "string") {
    // Fallback to package name if repository field is missing
    return pkg.name;
  }

  const url = repo.url;
  if (!url) {
    return pkg.name;
  }

  // Extract repo name from GitHub URL
  const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(\.git)?$/);
  if (match && match[2]) {
    return match[2];
  }

  // Fallback to package name
  return pkg.name;
}

export default defineConfig(({ mode }) => {
  // In production mode, use repository name as base path for GitHub Pages
  // In development mode, use root path for local dev server
  const base = mode === "production" ? `/${getRepoName()}/` : "/";

  return {
    plugins: [react()],
    root: ".",
    base,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      outDir: "dist-demo",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
    server: {
      port: 5900,
      open: true,
    },
  };
});
