import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../..");

export default defineConfig({
  testDir: "./tests",
  testMatch: "gallery.spec.mjs",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["line"]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
      scale: "css",
    },
  },
  snapshotPathTemplate: path.join(
    repositoryRoot,
    "docs/screenshots/{arg}{ext}",
  ),
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    timezoneId: "UTC",
    trace: "off",
    video: "off",
  },
  webServer: {
    command: "node ./src/fixture-server.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
