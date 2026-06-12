import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Config dedicada de testes — isolada do build (sem PWA/lovable-tagger).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@avaluz/ui": path.resolve(__dirname, "./packages/ui/index.ts"),
      "@avaluz/lib": path.resolve(__dirname, "./packages/lib/index.ts"),
      "@avaluz/types": path.resolve(__dirname, "./packages/types/index.ts"),
      "@avaluz/api": path.resolve(__dirname, "./packages/api/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["packages/**/*.{ts,tsx}"],
      exclude: ["packages/**/index.ts", "**/*.d.ts"],
    },
  },
});
