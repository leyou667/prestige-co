import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // "server-only" refuse d'être importé hors de React Server Components : neutralisé pour les tests
      "server-only": path.resolve(__dirname, "tests/server-only-stub.ts"),
    },
  },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
