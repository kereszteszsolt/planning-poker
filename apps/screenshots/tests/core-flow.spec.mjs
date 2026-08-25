import { expect, test } from "@playwright/test";

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844 };

const watchBrowserErrors = (page) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  return errors;
};

const openHome = async (page) => {
  await page.goto("/index.html");
  await expect(
    page.getByRole("heading", { name: "Planning Poker" }),
  ).toBeVisible();
};

const createRoom = async (page, name) => {
  await openHome(page);
  await page.getByRole("button", { name: "Create Room" }).click();
  await expect(page).toHaveURL(/\/room\/[0-9a-f-]{36}$/);
  const roomId = new URL(page.url()).pathname.split("/").at(-1);
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Join Room" }).click();
  await expect(
    page.getByRole("heading", { name: "Cast your estimate" }),
  ).toBeVisible();
  return roomId;
};

const joinRoom = async (page, roomId, name) => {
  await page.goto(`/room/${roomId}`);
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Join Room" }).click();
  await expect(
    page.getByRole("heading", { name: "Cast your estimate" }),
  ).toBeVisible();
};

const assertNoHorizontalOverflow = async (page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

test("three isolated browser contexts converge through voting, reveal, reset, delegation, removal, and reload recovery", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext({ viewport: desktop }),
    browser.newContext({ viewport: desktop }),
    browser.newContext({ viewport: mobile }),
  ]);
  const pages = await Promise.all(contexts.map((context) => context.newPage()));
  const browserErrors = [];
  for (const page of pages) {
    page.on("console", (message) => {
      if (message.type() === "error")
        browserErrors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) =>
      browserErrors.push(`page: ${error.message}`),
    );
  }

  try {
    const [moderator, participant, mobileParticipant] = pages;
    const roomId = await createRoom(moderator, "Ada Moderator");
    await joinRoom(participant, roomId, "Lin Participant");
    await joinRoom(mobileParticipant, roomId, "Sam Mobile");

    for (const page of pages) {
      const participants = page
        .getByRole("heading", { name: "Participants" })
        .locator("..");
      await expect(participants).toBeVisible();
      await expect(participants.getByTitle("Ada Moderator")).toBeVisible();
      await expect(participants.getByTitle("Lin Participant")).toBeVisible();
      await expect(participants.getByTitle("Sam Mobile")).toBeVisible();
    }

    await moderator.getByRole("button", { name: "3", exact: true }).click();
    await participant.getByRole("button", { name: "5", exact: true }).click();
    await expect(
      mobileParticipant.getByLabel("Ada Moderator submitted a vote"),
    ).toBeVisible();
    await moderator.getByRole("button", { name: "Reveal Votes" }).click();
    await expect(
      participant.getByRole("heading", { name: "Statistics" }),
    ).toBeVisible();
    await expect(participant.getByLabel("Ada Moderator voted 3")).toBeVisible();

    await moderator.getByRole("button", { name: "Reset Votes" }).click();
    const resetDialog = moderator.getByRole("alertdialog", {
      name: "Confirm vote reset",
    });
    await expect(resetDialog).toBeVisible();
    await resetDialog.getByRole("button", { name: "Confirm reset" }).click();
    await expect(participant.getByText("Waiting for a vote")).toBeVisible();

    await moderator
      .getByRole("button", { name: "Make Lin Participant the moderator" })
      .click();
    await expect(
      participant.getByRole("button", { name: "Reveal Votes" }),
    ).toBeVisible();
    await participant
      .getByRole("button", { name: "Remove Sam Mobile from the room" })
      .click();
    const removalDialog = participant.getByRole("alertdialog", {
      name: "Confirm removal of Sam Mobile",
    });
    await removalDialog
      .getByRole("button", { name: "Confirm removal" })
      .click();
    await expect(
      mobileParticipant.getByRole("heading", { name: "Kicked Out" }),
    ).toBeVisible();

    await participant.reload();
    await expect(
      participant.getByRole("heading", { name: "Cast your estimate" }),
    ).toBeVisible();
    await expect(participant.getByText("You", { exact: true })).toBeVisible();
    await assertNoHorizontalOverflow(mobileParticipant);
    expect(browserErrors).toEqual([]);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});

test("keyboard-operated mobile flow stays usable without blocking dialogs or overflow", async ({
  page,
}) => {
  await page.setViewportSize(mobile);
  const browserErrors = watchBrowserErrors(page);
  await openHome(page);
  await page.getByLabel("Room ID").focus();
  await page.getByLabel("Room ID").fill("not-a-room-id");
  await page.getByLabel("Room ID").press("Enter");
  await expect(page.getByRole("heading", { name: "Join Room" })).toBeVisible();
  await page.getByLabel("Your name").fill("Mobile Guest");
  await page.getByLabel("Your name").press("Enter");
  await expect(page.getByRole("alert")).toContainText("valid room UUID");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);
  expect(browserErrors).toEqual([]);
});
