import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublicError, Room } from "@planning-poker/contracts";
import {
  createPlanningPokerStateController,
  createPlanningPokerStore,
  selectActiveRoomId,
  selectAllVoteInputs,
  selectCanReset,
  selectCanReveal,
  selectCanRevoke,
  selectConnectionMessage,
  selectConnectionStatus,
  selectCurrentParticipant,
  selectCurrentParticipantId,
  selectCurrentVote,
  selectError,
  selectErrorMessage,
  selectExitReason,
  selectHasCurrentParticipant,
  selectHasRoom,
  selectHasSession,
  selectIsModerator,
  selectNumericStatisticsInputs,
  selectParticipants,
  selectRoom,
  selectRoomRevealed,
  selectRoomValueSet,
  selectVotedParticipantCount,
} from "./planning-poker-store";
import { PlanningPokerStoreProvider } from "./PlanningPokerStoreProvider";
import { usePlanningPokerSelector } from "./planning-poker-store-context";

const roomId = "70d27440-40d7-4a4b-bc2f-30935060dc8d";
const participantId = "cc220b09-3714-4da4-904f-087b06a96b82";
const room = (lastUpdated = 1): Room => ({
  id: roomId,
  valueSet: "scrum",
  revealed: false,
  lastUpdated,
  participants: {
    [participantId]: {
      id: participantId,
      name: "Alice",
      voted: true,
      vote: 5,
      isModerator: true,
    },
    second: {
      id: "second",
      name: "Bob",
      voted: true,
      vote: "?",
      isModerator: false,
    },
  },
});

const session = {
  roomId,
  participantId,
  name: "Alice",
  sessionToken: "session-token",
};

describe("planning poker store", () => {
  it("applies every transition through serializable slices and resets privacy-sensitive state", () => {
    const store = createPlanningPokerStore();
    const state = createPlanningPokerStateController(store);
    const error: PublicError = {
      code: "NOT_AUTHORIZED",
      message: "Moderator access is required.",
      recoverable: true,
    };

    state.setConnectionStatus("connected");
    state.activateRoom(roomId, session);
    state.acceptSession(session, room());
    state.setError(error);

    expect(selectConnectionStatus(store.getState())).toBe("connected");
    expect(selectConnectionMessage(store.getState())).toContain("ready");
    expect(selectActiveRoomId(store.getState())).toBe(roomId);
    expect(selectHasSession(store.getState())).toBe(true);
    expect(selectRoom(store.getState())).toEqual(room());
    expect(selectHasRoom(store.getState())).toBe(true);
    expect(Object.keys(selectParticipants(store.getState()))).toHaveLength(2);
    expect(selectRoomValueSet(store.getState())).toBe("scrum");
    expect(selectRoomRevealed(store.getState())).toBe(false);
    expect(selectCurrentParticipantId(store.getState())).toBe(participantId);
    expect(selectCurrentParticipant(store.getState())?.name).toBe("Alice");
    expect(selectHasCurrentParticipant(store.getState())).toBe(true);
    expect(selectIsModerator(store.getState())).toBe(true);
    expect(selectVotedParticipantCount(store.getState())).toBe(2);
    expect(selectCanReveal(store.getState())).toBe(true);
    expect(selectCanReset(store.getState())).toBe(true);
    expect(selectCanRevoke(store.getState())).toBe(true);
    expect(selectCurrentVote(store.getState())).toBe(5);
    const numericStatisticsInputs = selectNumericStatisticsInputs(
      store.getState(),
    );
    expect(numericStatisticsInputs).toEqual([5]);
    expect(selectAllVoteInputs(store.getState())).toEqual([5, "?"]);
    expect(selectError(store.getState())).toEqual(error);
    expect(selectErrorMessage(store.getState())).toBe(error.message);
    expect(JSON.parse(JSON.stringify(store.getState()))).toEqual(
      store.getState(),
    );

    state.clearError();
    expect(selectNumericStatisticsInputs(store.getState())).toBe(
      numericStatisticsInputs,
    );
    state.clearSession(roomId);
    expect(store.getState().session).toMatchObject({
      activeRoomId: roomId,
      participantId: null,
      displayName: null,
      sessionToken: null,
    });
    expect(store.getState().room.snapshot).toBeNull();

    state.acceptSession(session, room(2));
    state.resetRoom("kicked-out");
    expect(store.getState().session.activeRoomId).toBeNull();
    expect(store.getState().room.snapshot).toBeNull();
    expect(selectExitReason(store.getState())).toBe("kicked-out");
    expect(store.getState().connection.status).toBe("connected");
    state.clearExitReason();
    expect(selectExitReason(store.getState())).toBeNull();
    expect(window.localStorage).toHaveLength(0);
  });

  it("rejects snapshots for inactive rooms, ignores stale/duplicate updates, and preserves equal-timestamp changes", () => {
    const store = createPlanningPokerStore();
    const state = createPlanningPokerStateController(store);
    state.activateRoom(roomId, session);
    state.acceptSession(session, room(2));
    const accepted = store.getState();

    state.replaceRoom(room(1));
    state.replaceRoom(room(2));
    state.replaceRoom({ ...room(3), id: "another-room" });
    expect(store.getState()).toBe(accepted);

    const changed = room(2);
    changed.revealed = true;
    state.replaceRoom(changed);
    expect(store.getState().room.snapshot?.revealed).toBe(true);

    const otherSession = { ...session, roomId: "another-room" };
    state.acceptSession(otherSession, { ...room(4), id: "another-room" });
    expect(store.getState().session.activeRoomId).toBe(roomId);
  });

  it("isolates selector subscribers from unrelated state changes", () => {
    const store = createPlanningPokerStore();
    const state = createPlanningPokerStateController(store);
    let connectionRenders = 0;
    let errorRenders = 0;

    const ConnectionProbe = () => {
      usePlanningPokerSelector((value) => value.connection.status);
      connectionRenders += 1;
      return null;
    };
    const ErrorProbe = () => {
      usePlanningPokerSelector((value) => value.ui.error?.message ?? "");
      errorRenders += 1;
      return null;
    };

    render(
      <PlanningPokerStoreProvider store={store}>
        <ConnectionProbe />
        <ErrorProbe />
      </PlanningPokerStoreProvider>,
    );
    const connectionBefore = connectionRenders;
    const errorBefore = errorRenders;

    act(() =>
      state.setError({
        code: "SERVER_ERROR",
        message: "Temporary error",
        recoverable: true,
      }),
    );
    expect(connectionRenders).toBe(connectionBefore);
    expect(errorRenders).toBe(errorBefore + 1);
  });
});
