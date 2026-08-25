import assert from "node:assert/strict";
import test from "node:test";
import {
  createFixtureRooms,
  fixedTime,
  roomIds,
  sessionTokenFor,
} from "../src/fixtures.mjs";

test("screenshot fixtures use stable invented rooms, identities, and votes", () => {
  const first = createFixtureRooms();
  const second = createFixtureRooms();

  assert.deepEqual(
    [...first.keys()],
    [roomIds.voting, roomIds.results, roomIds.mobile],
  );
  assert.deepEqual([...first.values()], [...second.values()]);
  assert.ok(
    [...first.values()].every((room) => room.lastUpdated === fixedTime),
  );

  const participantNames = new Set(
    [...first.values()].flatMap((room) =>
      Object.values(room.participants).map((participant) => participant.name),
    ),
  );
  assert.deepEqual(
    participantNames,
    new Set([
      "Ada Moderator",
      "Lin Participant",
      "Grace Observer",
      "Sam Developer",
    ]),
  );

  for (const room of first.values()) {
    for (const participant of Object.values(room.participants)) {
      assert.match(participant.id, /^[0-9a-f-]{36}$/);
      assert.match(sessionTokenFor(participant.id), /^[0-9a-f-]{36}$/);
    }
  }
});

test("fixture factory returns isolated mutable snapshots", () => {
  const first = createFixtureRooms();
  const second = createFixtureRooms();
  const firstVotingRoom = first.get(roomIds.voting);
  const secondVotingRoom = second.get(roomIds.voting);

  firstVotingRoom.participants["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"].vote =
    13;

  assert.equal(
    secondVotingRoom.participants["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"].vote,
    5,
  );
});
