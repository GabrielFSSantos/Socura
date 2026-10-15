import { defineConfig, devices } from "@playwright/test";

const skipWebServer = process.env.PW_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  retries: 0,
  reporter: [["list"]],
  outputDir: "e2e/artifacts",
  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: "node scripts/e2e-static-server.mjs",
          port: 4173,
          reuseExistingServer: !process.env.CI,
        },
      }),
  projects: [
    {
      name: "preview",
      testMatch: /preview\/.*\.spec\.ts/,
      use: {
        baseURL: "http://127.0.0.1:4173",
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "session-x",
      testMatch: /session\/x-.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PW_CHANNEL || "chrome",
      },
    },
    {
      name: "session-ig",
      testMatch: /session\/ig-.*\.spec\.ts/,
      dependencies: ["session-x"],
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PW_CHANNEL || "chrome",
      },
    },
  ],
});
