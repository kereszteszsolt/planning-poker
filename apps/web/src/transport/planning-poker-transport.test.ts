import { describe, expect, it, vi } from "vitest";
import type { Room } from "@planning-poker/contracts";
import { FakeSocket } from "../test/fake-socket";
import {
  createPlanningPokerStore,
  selectErrorMessage,
} from "../state/planning-poker-store";
import type { RoomSession } from "../shared/room-session";
import {
  createPlanningPokerTransport,
  type RoomSessionRepository,
} from "./planning-poker-transport";

const roomId = "70d27440-40d7-4a4b-bc2f-30935060dc8d";
const participant = {
  id: "cc220b09-3714-4da4-904f-087b06a96b82",
  name: "Alice",
  voted: false,
  isModerator: true,
};
const room = (lastUpdated = 1): Room => ({
  id: roomId,
  valueSet: "scrum",
  participants: { [participant.id]: participant },
  revealed: false,
  lastUpdated,
});
const savedSession: RoomSession = {
  roomId,
  participantId: participant.id,
  name: participant.name,
  sessionToken: "session-token",
};

const createMemorySessions = (initial?: RoomSession) => {
  const sessions = new Map<string, RoomSession>();
  if (initial) sessions.set(initial.roomId, initial);
  const repository: RoomSessionRepository = {
    read: vi.fn((id) => sessions.get(id) ?? null),
    write: vi.fn((session) => sessions.set(session.roomId, session)),
    clear: vi.fn((id) => sessions.delete(id)),
  };
  return { repository, sessions };
};

describe("planning poker socket transport", () => {
  it("registers and removes one listener set and resumes once per connection", () => {
    const fake = new FakeSocket();
    fake.connected = true;
    const requests: unknown[] = [];
    fake.respondTo("join-room", (payload, callback) => {
      requests.push(payload);
      callback({
        ok: true,
        data: { participant, sessionToken: "session-token", room: room() },
      });
    });
    const store = createPlanningPokerStore();
    const { repository } = createMemorySessions(savedSession);
    const transport = createPlanningPokerTransport({
      socket: fake.asApplicationSocket(),
      store,
      sessionRepository: repository,
    });

    const stop = transport.start();
    const duplicateStop = transport.start();
    transport.activateRoom(roomId);
    transport.activateRoom(roomId);

    expect(fake.listenerCount("connect")).toBe(1);
    expect(fake.listenerCount("room-updated")).toBe(1);
    expect(fake.manager.listenerCount("reconnect_attempt")).toBe(1);
    expect(requests).toHaveLength(1);

    fake.trigger("connect");
    expect(requests).toHaveLength(2);
    expect(store.getState().room.snapshot).toEqual(room());

    duplicateStop();
    expect(fake.listenerCount("connect")).toBe(1);
    stop();
    expect(fake.listenerCount("connect")).toBe(0);
    expect(fake.listenerCount("room-updated")).toBe(0);
    expect(fake.manager.listenerCount("reconnect_attempt")).toBe(0);
  });

  it("normalizes acknowledgements, applies canonical snapshots, and maps every room action", async () => {
    const fake = new FakeSocket();
    fake.connected = true;
    const store = createPlanningPokerStore();
    const { repository, sessions } = createMemorySessions();
    const transport = createPlanningPokerTransport({
      socket: fake.asApplicationSocket(),
      store,
      sessionRepository: repository,
    });
    const stop = transport.start();
    transport.activateRoom(roomId);

    fake.respondTo("join-room", (_payload, callback) =>
      callback({
        ok: true,
        data: { participant, sessionToken: "new-token", room: room() },
      }),
    );
    transport.joinRoom(" Alice ");
    expect(sessions.get(roomId)).toMatchObject({
      participantId: participant.id,
      name: "Alice",
      sessionToken: "new-token",
    });

    const successfulRoomAction = (
      _payload: unknown,
      callback: (value: unknown) => void,
    ) => callback({ ok: true, data: { room: room(2) } });
    for (const event of [
      "vote",
      "revoke",
      "reveal",
      "reset",
      "change-value-set",
      "delegate",
      "kick-out",
    ]) {
      fake.respondTo(event, successfulRoomAction);
    }

    transport.vote(5);
    transport.revoke();
    transport.reveal();
    transport.reset();
    transport.changeValueSet("fibonacci");
    transport.delegate("second");
    transport.kickOut("second");
    expect(fake.emissions.map(({ event }) => event)).toEqual(
      expect.arrayContaining([
        "join-room",
        "vote",
        "revoke",
        "reveal",
        "reset",
        "change-value-set",
        "delegate",
        "kick-out",
      ]),
    );
    expect(store.getState().room.snapshot?.lastUpdated).toBe(2);

    fake.respondTo("vote", (_payload, callback) =>
      callback({
        ok: false,
        error: {
          code: "INVALID_STATE",
          message: "Voting is closed.",
          recoverable: true,
        },
      }),
    );
    transport.vote(8);
    expect(selectErrorMessage(store.getState())).toBe("Voting is closed.");

    fake.respondTo("leave-room", (_payload, callback) =>
      callback({ ok: true, data: undefined }),
    );
    expect(await transport.leaveRoom()).toBe(true);
    expect(store.getState().session.activeRoomId).toBeNull();
    expect(sessions.size).toBe(0);
    stop();
  });

  it("clears invalid resumptions and every forced-exit path before exposing an exit reason", () => {
    for (const event of [
      "room-closed",
      "kicked-out",
      "session-replaced",
    ] as const) {
      const fake = new FakeSocket();
      fake.connected = true;
      fake.respondTo("join-room", (_payload, callback) =>
        callback({
          ok: false,
          error: {
            code: "SESSION_EXPIRED",
            message: "The saved session expired.",
            recoverable: true,
          },
        }),
      );
      const store = createPlanningPokerStore();
      const { repository, sessions } = createMemorySessions(savedSession);
      const transport = createPlanningPokerTransport({
        socket: fake.asApplicationSocket(),
        store,
        sessionRepository: repository,
      });
      const stop = transport.start();
      transport.activateRoom(roomId);

      expect(store.getState().session.participantId).toBeNull();
      expect(sessions.size).toBe(0);
      expect(selectErrorMessage(store.getState())).toContain("expired");

      fake.trigger(event, { code: "INVALID_STATE", message: "Room ended" });
      expect(store.getState().session.activeRoomId).toBeNull();
      expect(store.getState().room.snapshot).toBeNull();
      expect(store.getState().ui.exitReason).toBe(
        event === "room-closed" ? "closed" : event,
      );
      stop();
    }
  });

  it("resets session data on explicit home and unrecoverable server disconnect", () => {
    const fake = new FakeSocket();
    fake.connected = true;
    fake.respondTo("join-room", (_payload, callback) =>
      callback({
        ok: true,
        data: { participant, sessionToken: "new-token", room: room() },
      }),
    );
    const store = createPlanningPokerStore();
    const { repository, sessions } = createMemorySessions();
    const transport = createPlanningPokerTransport({
      socket: fake.asApplicationSocket(),
      store,
      sessionRepository: repository,
    });
    const stop = transport.start();
    transport.activateRoom(roomId);
    transport.joinRoom("Alice");

    transport.returnHome();
    expect(store.getState().session.activeRoomId).toBeNull();
    expect(store.getState().room.snapshot).toBeNull();
    expect(sessions.size).toBe(0);
    expect(fake.emissions.at(-1)?.event).toBe("leave-room");

    transport.activateRoom(roomId);
    transport.joinRoom("Alice");
    fake.trigger("disconnect", "io server disconnect");
    expect(store.getState().connection.status).toBe("session-lost");
    expect(store.getState().session.participantId).toBeNull();
    expect(store.getState().room.snapshot).toBeNull();
    expect(sessions.size).toBe(0);
    stop();
  });
});
