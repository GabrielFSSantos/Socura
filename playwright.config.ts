import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const storageState = "e2e/.auth/storage-state.json";

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  retries: 0,
  reporter: [["list"]],
  outputDir: "e2e/artifacts",
  webServer: {
    command: "node scripts/e2e-static-server.mjs",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    ...devices["Desktop Chrome"],
    ...(existsSync(storageState) ? { storageState } : {}),
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
