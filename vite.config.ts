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
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
        // Preserve the entry names for subpath exports
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
      },
    },
    sourcemap: true,
  },
});
