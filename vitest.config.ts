import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/services/**/*.ts",
        "lib/validations/**/*.ts",
        "lib/utils/**/*.ts",
        "lib/tokens.ts",
        "lib/rate-limit.ts",
        "components/**/*.tsx",
      ],
    },
  },
});
