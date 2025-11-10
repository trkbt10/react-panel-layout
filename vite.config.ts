/**
 * @file Vite build configuration for library
 */

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.tsx"),
        config: resolve(__dirname, "src/config/index.tsx"),
        floating: resolve(__dirname, "src/floating/index.ts"),
      },
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: [
        {
          format: "es",
          // Preserve the entry names for subpath exports
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          // Preserve module structure for better tree-shaking
          preserveModules: false,
        },
        {
          format: "cjs",
          // Use .cjs extension for CommonJS files
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name]-[hash].cjs",
          preserveModules: false,
        },
      ],
    },
    sourcemap: true,
    // Ensure CSS is emitted as a single file
    cssCodeSplit: false,
  },
  css: {
    modules: {
      // Generate scoped class names for CSS modules
      localsConvention: "camelCaseOnly",
    },
  },
});
