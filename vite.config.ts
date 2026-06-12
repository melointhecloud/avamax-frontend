import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  define: {
    __APP_VERSION__: JSON.stringify(new Date().toISOString()),
    // Add global Buffer for @react-pdf/renderer
    global: 'globalThis',
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Add node polyfills for Buffer and other Node.js globals
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Which global shims to inject.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@avaluz/ui": path.resolve(__dirname, "./packages/ui/index.ts"),
      "@avaluz/lib": path.resolve(__dirname, "./packages/lib/index.ts"),
      "@avaluz/types": path.resolve(__dirname, "./packages/types/index.ts"),
      "@avaluz/api": path.resolve(__dirname, "./packages/api/index.ts"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          react: ["react", "react-dom", "react-router-dom"],
          recharts: ["recharts"],
        },
      },
    },
  },
}));
