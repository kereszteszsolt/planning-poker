import assert from "node:assert/strict";
import test from "node:test";
import {
  clientEventSchemas,
  displayNameSchema,
  roomIdSchema,
  valueSets,
} from "../dist/index.js";

const roomId = "70d27440-40d7-4a4b-bc2f-30935060dc8d";

test("normalizes valid public input", () => {
  assert.equal(roomIdSchema.parse(` ${roomId} `), roomId);
  assert.equal(displayNameSchema.parse("  Alice  "), "Alice");
});

test("rejects malformed event payloads at runtime", () => {
  assert.equal(clientEventSchemas["create-room"].safeParse(null).success, false);
  assert.equal(
    clientEventSchemas["join-room"].safeParse({ roomId, name: "A" }).success,
    false,
  );
  assert.equal(
    clientEventSchemas.vote.safeParse({ roomId, vote: { unsafe: true } }).success,
    false,
  );
});

test("keeps forward-compatible event metadata out of validated payloads", () => {
  const result = clientEventSchemas["create-room"].safeParse({ future: true });
  assert.equal(result.success, true);
  assert.deepEqual(result.data, {});
});

test("publishes the supported value sets", () => {
  assert.deepEqual(Object.keys(valueSets), ["scrum", "fibonacci", "tshirt", "days"]);
});
