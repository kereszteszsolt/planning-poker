import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { io as createClient } from "socket.io-client";
import { loadRuntimeConfig } from "../dist/config.js";
import { createPlanningPokerServer } from "../dist/server.js";

const clients = [];
let activeServer;

afterEach(async () => {
  for (const client of clients.splice(0)) client.disconnect();
  if (activeServer) await activeServer.stop();
  activeServer = undefined;
});

const startServer = async (overrides = {}, now) => {
  const config = {
    ...loadRuntimeConfig({}),
    port: 0,
    cleanupIntervalMs: 60_000,
    ...overrides,
  };
  activeServer = createPlanningPokerServer({ config, now });
  const address = await activeServer.start();
  return `http://${address.host}:${address.port}`;
};

const connect = (url) =>
  new Promise((resolve, reject) => {
    const client = createClient(url, {
      forceNew: true,
      reconnection: false,
      transports: ["websocket"],
    });
    clients.push(client);
    client.once("connect", () => resolve(client));
    client.once("connect_error", reject);
  });

const emitAck = (client, event, payload) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No acknowledgement for ${event}`)),
      2_000,
    );
    client.emit(event, payload, (response) => {
      clearTimeout(timer);
      resolve(response);
    });
  });

const eventOnce = (client, event) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No ${event} event`)),
      2_000,
    );
    client.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

const eventMatching = (client, event, predicate) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.off(event, handler);
      reject(new Error(`No matching ${event} event`));
    }, 2_000);
    const handler = (payload) => {
      if (!predicate(payload)) return;
      clearTimeout(timer);
      client.off(event, handler);
      resolve(payload);
    };
    client.on(event, handler);
  });

const waitFor = async (predicate) => {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() > deadline)
      throw new Error("Condition was not reached in time");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const createRoom = async (client) => {
  const response = await emitAck(client, "create-room", {});
  assert.equal(response.ok, true);
  return response.data.roomId;
};

const joinRoom = async (client, roomId, name, sessionToken) => {
  const response = await emitAck(client, "join-room", {
    roomId,
    name,
    sessionToken,
  });
  assert.equal(response.ok, true, response.error?.message);
  return response.data;
};

test("production configuration requires explicit non-wildcard origins", () => {
  assert.throws(
    () => loadRuntimeConfig({ NODE_ENV: "production" }),
    /PP_ALLOWED_ORIGINS/,
  );
  assert.throws(
    () =>
      loadRuntimeConfig({ NODE_ENV: "production", PP_ALLOWED_ORIGINS: "*" }),
    /cannot contain/,
  );
  assert.deepEqual(
    loadRuntimeConfig({
      NODE_ENV: "production",
      PP_ALLOWED_ORIGINS: "https://poker.example",
    }).allowedOrigins,
    ["https://poker.example"],
  );
});

test("validates room IDs and names, refuses implicit rooms, duplicate names, and overflow", async () => {
  const url = await startServer({ maxParticipants: 2 });
  const alice = await connect(url);
  const unknown = await emitAck(alice, "join-room", {
    roomId: "70d27440-40d7-4a4b-bc2f-30935060dc8d",
    name: "Alice",
  });
  assert.equal(unknown.error.code, "ROOM_NOT_FOUND");
  const specialKey = await emitAck(alice, "join-room", {
    roomId: "__proto__",
    name: "Alice",
  });
  assert.equal(specialKey.error.code, "INVALID_ROOM_ID");

  const roomId = await createRoom(alice);
  assert.equal(
    (await emitAck(alice, "create-room", null)).error.code,
    "INVALID_PAYLOAD",
  );
  assert.equal(
    (await emitAck(alice, "join-room", { roomId, name: "A" })).error.code,
    "INVALID_NAME",
  );
  assert.equal(
    (await emitAck(alice, "join-room", { roomId, name: "Al\nice" })).error.code,
    "INVALID_NAME",
  );
  const aliceJoin = await joinRoom(alice, roomId, "  Alice  ");

  const bob = await connect(url);
  assert.equal(
    (await emitAck(bob, "join-room", { roomId, name: "ALICE" })).error.code,
    "NAME_TAKEN",
  );
  await joinRoom(bob, roomId, "Bob");
  const carol = await connect(url);
  assert.equal(
    (await emitAck(carol, "join-room", { roomId, name: "Carol" })).error.code,
    "ROOM_FULL",
  );
  alice.disconnect();
  await waitFor(() => activeServer.rooms.get(roomId).participants.size === 1);
  await joinRoom(carol, roomId, "Carol");
  const recoveringAlice = await connect(url);
  assert.equal(
    (
      await emitAck(recoveringAlice, "join-room", {
        roomId,
        name: "Alice",
        sessionToken: aliceJoin.sessionToken,
      })
    ).error.code,
    "ROOM_FULL",
  );
});

test("acknowledges authorization failures and keeps moderation and removal deterministic", async () => {
  const url = await startServer();
  const alice = await connect(url);
  const bob = await connect(url);
  const carol = await connect(url);
  const roomId = await createRoom(alice);
  const aliceJoin = await joinRoom(alice, roomId, "Alice");
  const bobJoin = await joinRoom(bob, roomId, "Bob");
  const carolJoin = await joinRoom(carol, roomId, "Carol");

  assert.equal(
    (await emitAck(bob, "reveal", { roomId })).error.code,
    "NOT_AUTHORIZED",
  );
  assert.equal(
    (await emitAck(alice, "vote", { roomId, vote: "invalid" })).error.code,
    "INVALID_VOTE",
  );
  assert.equal((await emitAck(alice, "vote", { roomId, vote: 3 })).ok, true);
  const revoked = await emitAck(alice, "revoke", { roomId });
  assert.equal(
    revoked.data.room.participants[aliceJoin.participant.id].voted,
    false,
  );
  assert.equal((await emitAck(alice, "vote", { roomId, vote: 5 })).ok, true);
  assert.equal(
    (await emitAck(alice, "reveal", { roomId })).data.room.revealed,
    true,
  );
  const reset = await emitAck(alice, "reset", { roomId });
  assert.equal(reset.data.room.revealed, false);
  assert.equal(
    Object.values(reset.data.room.participants).every(
      (participant) => !participant.voted,
    ),
    true,
  );
  const changed = await emitAck(alice, "change-value-set", {
    roomId,
    valueSet: "tshirt",
  });
  assert.equal(changed.data.room.valueSet, "tshirt");
  assert.equal(
    (await emitAck(alice, "take-over", { roomId })).error.code,
    "INVALID_STATE",
  );
  assert.equal(
    (
      await emitAck(alice, "delegate", {
        roomId,
        participantId: aliceJoin.participant.id,
      })
    ).error.code,
    "INVALID_TARGET",
  );
  assert.equal(
    (await emitAck(alice, "delegate", { roomId, participantId: "missing" }))
      .error.code,
    "PARTICIPANT_NOT_FOUND",
  );
  const delegated = await emitAck(alice, "delegate", {
    roomId,
    participantId: bobJoin.participant.id,
  });
  assert.equal(delegated.ok, true);
  assert.equal(
    Object.values(delegated.data.room.participants).filter(
      (participant) => participant.isModerator,
    ).length,
    1,
  );
  assert.equal(
    delegated.data.room.participants[bobJoin.participant.id].isModerator,
    true,
  );

  const kicked = eventOnce(carol, "kicked-out");
  const kickResponse = await emitAck(bob, "kick-out", {
    roomId,
    participantId: carolJoin.participant.id,
  });
  assert.equal(kickResponse.ok, true);
  assert.equal(
    (await kicked).message,
    "The moderator removed you from this room.",
  );
  assert.equal(
    (await emitAck(carol, "vote", { roomId, vote: 3 })).error.code,
    "NOT_A_PARTICIPANT",
  );

  const moderatorTransfer = eventOnce(alice, "room-updated");
  bob.disconnect();
  const afterDisconnect = await moderatorTransfer;
  assert.equal(
    afterDisconnect.participants[aliceJoin.participant.id].isModerator,
    true,
  );
  assert.equal(Object.keys(afterDisconnect.participants).length, 1);
  assert.equal((await emitAck(alice, "leave-room", { roomId })).ok, true);
  assert.equal(activeServer.rooms.size, 0);
});

test("resumes a disconnected participant by session token without duplicating identity", async () => {
  const url = await startServer();
  const alice = await connect(url);
  const bob = await connect(url);
  const roomId = await createRoom(alice);
  const aliceJoin = await joinRoom(alice, roomId, "Alice");
  const bobJoin = await joinRoom(bob, roomId, "Bob");
  assert.equal((await emitAck(alice, "vote", { roomId, vote: 5 })).ok, true);

  const removal = eventMatching(
    bob,
    "room-updated",
    (updatedRoom) =>
      updatedRoom.participants[aliceJoin.participant.id] === undefined,
  );
  alice.disconnect();
  const afterRemoval = await removal;
  assert.equal(afterRemoval.participants[aliceJoin.participant.id], undefined);
  assert.equal(
    afterRemoval.participants[bobJoin.participant.id].isModerator,
    true,
  );

  const nameProbe = await connect(url);
  assert.equal(
    (await emitAck(nameProbe, "join-room", { roomId, name: "Alice" })).error
      .code,
    "NAME_TAKEN",
  );
  const recoveredSocket = await connect(url);
  const recovered = await joinRoom(
    recoveredSocket,
    roomId,
    "Alice",
    aliceJoin.sessionToken,
  );
  assert.equal(recovered.participant.id, aliceJoin.participant.id);
  assert.equal(recovered.participant.voted, true);
  assert.equal(recovered.participant.vote, 5);
  assert.equal(Object.keys(recovered.room.participants).length, 2);

  const idempotent = await emitAck(recoveredSocket, "join-room", {
    roomId,
    name: "Alice",
    sessionToken: aliceJoin.sessionToken,
  });
  assert.equal(idempotent.ok, true);
  assert.equal(Object.keys(idempotent.data.room.participants).length, 2);
});

test("deletes the last disconnected room and emits closure before deterministic cleanup", async () => {
  let clock = 1_000;
  const url = await startServer({ roomTtlMs: 1_000 }, () => clock);
  const alice = await connect(url);
  const roomId = await createRoom(alice);
  const aliceJoin = await joinRoom(alice, roomId, "Alice");
  alice.disconnect();
  await waitFor(() => activeServer.rooms.size === 0);

  const replacement = await connect(url);
  const lost = await emitAck(replacement, "join-room", {
    roomId,
    name: "Alice",
    sessionToken: aliceJoin.sessionToken,
  });
  assert.equal(lost.error.code, "ROOM_NOT_FOUND");

  const cleanupRoomId = await createRoom(replacement);
  await joinRoom(replacement, cleanupRoomId, "Robin");
  const closed = eventOnce(replacement, "room-closed");
  clock = 2_500;
  activeServer.runCleanup();
  assert.equal((await closed).code, "ROOM_NOT_FOUND");
  assert.equal(activeServer.rooms.has(cleanupRoomId), false);
});
