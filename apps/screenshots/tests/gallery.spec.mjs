import { expect, test } from "@playwright/test";
import { fixedTime, roomIds } from "../src/fixtures.mjs";

const desktop = { width: 1440, height: 960 };
const mobile = { width: 430, height: 932 };
const localHost = "127.0.0.1";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript((timestamp) => {
    const NativeDate = Date;
    class FixedDate extends NativeDate {
      constructor(...arguments_) {
        super(...(arguments_.length > 0 ? arguments_ : [timestamp]));
      }

      static now() {
        return timestamp;
      }
    }
    globalThis.Date = FixedDate;
    Math.random = () => 0.125;
    Object.defineProperty(globalThis.crypto, "randomUUID", {
      configurable: true,
      value: () => "f0000000-0000-4000-8000-000000000006",
    });
  }, fixedTime);

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      ["data:", "blob:"].includes(url.protocol) ||
      url.hostname === localHost
    ) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
    throw new Error(`PP-009 blocked non-fixture request: ${url.href}`);
  });
});

const preparePage = async (page, viewport) => {
  await page.setViewportSize(viewport);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition: none !important;
      }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
};

const assertNoHorizontalOverflow = async (page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

const capture = async (page, filename) => {
  await assertNoHorizontalOverflow(page);
  await expect(page).toHaveScreenshot(filename, { fullPage: true });
};

const openJoinedRoom = async (page, roomId, viewport) => {
  await page.goto(`/room/${roomId}`);
  await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible();
  await page.getByLabel("Your name").fill("Ada Moderator");
  await page.getByRole("button", { name: "Join Room" }).click();
  await expect(
    page.getByRole("heading", { name: "Cast your estimate" }),
  ).toBeVisible();
  await preparePage(page, viewport);
};

test("captures the connected desktop home", async ({ page }) => {
  await page.setViewportSize(desktop);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Planning Poker" }),
  ).toBeVisible();
  await preparePage(page, desktop);
  await capture(page, "planning-poker-home-desktop.png");
});

test("captures the labeled desktop join flow", async ({ page }) => {
  await page.setViewportSize(desktop);
  await page.goto("/");
  await page.getByLabel("Room ID").fill(roomIds.join);
  await page.getByRole("button", { name: "Join Room" }).click();
  await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible();
  await page.getByLabel("Your name").fill("Lin Participant");
  await preparePage(page, desktop);
  await capture(page, "planning-poker-join-desktop.png");
});

test("captures hidden votes and moderator controls on desktop", async ({
  page,
}) => {
  await openJoinedRoom(page, roomIds.voting, desktop);
  await expect(page.getByLabel("Ada Moderator submitted a vote")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reveal Votes" }),
  ).toBeEnabled();
  await capture(page, "planning-poker-room-voting-desktop.png");
});

test("captures revealed numeric and special-card results", async ({ page }) => {
  await openJoinedRoom(page, roomIds.results, desktop);
  await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
  await expect(page.getByText("Special cards are shown")).toBeVisible();
  await capture(page, "planning-poker-room-results-desktop.png");
});

test("captures the full responsive room workflow", async ({ page }) => {
  await openJoinedRoom(page, roomIds.mobile, mobile);
  await expect(
    page.getByRole("heading", { name: "Participants" }),
  ).toBeVisible();
  await capture(page, "planning-poker-room-mobile.png");
});

test("captures actionable connection loss on mobile", async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Planning Poker" }),
  ).toBeVisible();
  const response = await page.request.post("/__pp_screenshots__/disconnect");
  expect(response.status()).toBe(204);
  await expect(
    page.getByRole("heading", { name: "Session connection lost" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry connection" }),
  ).toBeVisible();
  await preparePage(page, mobile);
  await capture(page, "planning-poker-disconnected-mobile.png");
});
