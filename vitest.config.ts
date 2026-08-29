import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
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
      ],
    },
  },
});
