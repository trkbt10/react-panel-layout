/**
 * @file Vite build configuration for library
 */

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to prevent CSS file emission
    {
      name: 'remove-css-emission',
      enforce: 'post',
      generateBundle(options, bundle) {
        // Remove CSS files from the bundle
        const filesToDelete: string[] = [];
        for (const fileName in bundle) {
          if (fileName.endsWith('.css')) {
            filesToDelete.push(fileName);
          }
        }
        filesToDelete.forEach(fileName => {
          delete bundle[fileName];
        });
      },
    },
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.tsx"),
        config: resolve(__dirname, "src/config/index.tsx"),
        floating: resolve(__dirname, "src/floating/index.ts"),
        pivot: resolve(__dirname, "src/pivot/index.ts"),
        "sticky-header": resolve(__dirname, "src/sticky-header/index.ts"),
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
    // Do not emit CSS files - users should import variables.css directly
    cssCodeSplit: false,
  },
  css: {
    modules: {
      // Generate scoped class names for CSS modules
      localsConvention: "camelCaseOnly",
    },
  },
});
