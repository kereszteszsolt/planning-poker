import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "core-flow.spec.mjs",
  outputDir: "./e2e-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["line"], ["html", { outputFolder: "e2e-report", open: "never" }]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "node ./src/e2e-server.mjs",
    url: "http://127.0.0.1:4174/index.html",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
