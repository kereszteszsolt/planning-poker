import type {
  Participant,
  PublicError,
  Room,
  Vote,
} from "@planning-poker/contracts";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { ConnectionStatus } from "../shared/connection-status";
import type { RoomSession } from "../shared/room-session";

export type ConnectionSlice = {
  status: ConnectionStatus;
};

export type SessionSlice = {
  activeRoomId: string | null;
  participantId: string | null;
  displayName: string | null;
  sessionToken: string | null;
};

export type RoomSlice = {
  snapshot: Room | null;
};

export type RoomExitReason = "closed" | "kicked-out" | "session-replaced";

export type UiSlice = {
  error: PublicError | null;
  exitReason: RoomExitReason | null;
};

export type PlanningPokerState = {
  connection: ConnectionSlice;
  session: SessionSlice;
  room: RoomSlice;
  ui: UiSlice;
};

export type PlanningPokerTransition =
  | { type: "connection-status-changed"; status: ConnectionStatus }
  | { type: "room-activated"; roomId: string; savedSession: RoomSession | null }
  | { type: "session-accepted"; session: RoomSession; room: Room }
  | { type: "session-cleared"; roomId: string }
  | { type: "room-replaced"; room: Room }
  | { type: "error-set"; error: PublicError }
  | { type: "error-cleared" }
  | { type: "room-reset"; exitReason: RoomExitReason | null }
  | { type: "exit-reason-cleared" };

const emptySession = (activeRoomId: string | null = null): SessionSlice => ({
  activeRoomId,
  participantId: null,
  displayName: null,
  sessionToken: null,
});

const initialState = (): PlanningPokerState => ({
  connection: { status: "initial" },
  session: emptySession(),
  room: { snapshot: null },
  ui: { error: null, exitReason: null },
});

const sessionFromSaved = (session: RoomSession): SessionSlice => ({
  activeRoomId: session.roomId,
  participantId: session.participantId,
  displayName: session.name,
  sessionToken: session.sessionToken,
});

const sameSession = (left: SessionSlice, right: SessionSlice) =>
  left.activeRoomId === right.activeRoomId &&
  left.participantId === right.participantId &&
  left.displayName === right.displayName &&
  left.sessionToken === right.sessionToken;

const sameError = (left: PublicError | null, right: PublicError | null) =>
  left?.code === right?.code &&
  left?.message === right?.message &&
  left?.recoverable === right?.recoverable;

const sameRoom = (left: Room, right: Room) =>
  left === right || JSON.stringify(left) === JSON.stringify(right);

export const reducePlanningPokerState = (
  state: PlanningPokerState,
  transition: PlanningPokerTransition,
): PlanningPokerState => {
  switch (transition.type) {
    case "connection-status-changed":
      return state.connection.status === transition.status
        ? state
        : { ...state, connection: { status: transition.status } };
    case "room-activated": {
      const nextSession = transition.savedSession
        ? sessionFromSaved(transition.savedSession)
        : emptySession(transition.roomId);
      if (
        state.session.activeRoomId === transition.roomId &&
        sameSession(state.session, nextSession) &&
        state.ui.error === null &&
        state.ui.exitReason === null
      ) {
        return state;
      }
      return {
        ...state,
        session: nextSession,
        room:
          state.session.activeRoomId === transition.roomId
            ? state.room
            : { snapshot: null },
        ui: { error: null, exitReason: null },
      };
    }
    case "session-accepted":
      if (state.session.activeRoomId !== transition.session.roomId)
        return state;
      return {
        ...state,
        session: sessionFromSaved(transition.session),
        room:
          state.room.snapshot && sameRoom(state.room.snapshot, transition.room)
            ? state.room
            : { snapshot: transition.room },
        ui: { ...state.ui, error: null },
      };
    case "session-cleared":
      if (state.session.activeRoomId !== transition.roomId) return state;
      return {
        ...state,
        session: emptySession(transition.roomId),
        room: { snapshot: null },
      };
    case "room-replaced": {
      if (state.session.activeRoomId !== transition.room.id) return state;
      const current = state.room.snapshot;
      if (
        current &&
        (current.lastUpdated > transition.room.lastUpdated ||
          sameRoom(current, transition.room))
      ) {
        return state;
      }
      return {
        ...state,
        room: { snapshot: transition.room },
        ui: { ...state.ui, error: null },
      };
    }
    case "error-set":
      return sameError(state.ui.error, transition.error)
        ? state
        : { ...state, ui: { ...state.ui, error: transition.error } };
    case "error-cleared":
      return state.ui.error === null
        ? state
        : { ...state, ui: { ...state.ui, error: null } };
    case "room-reset":
      return {
        ...state,
        session: emptySession(),
        room: { snapshot: null },
        ui: { error: null, exitReason: transition.exitReason },
      };
    case "exit-reason-cleared":
      return state.ui.exitReason === null
        ? state
        : { ...state, ui: { ...state.ui, exitReason: null } };
  }
};

export type PlanningPokerStore = StoreApi<PlanningPokerState>;

export const createPlanningPokerStore = (): PlanningPokerStore =>
  createStore<PlanningPokerState>()(() => initialState());

export const createPlanningPokerStateController = (
  store: PlanningPokerStore,
) => {
  const dispatch = (transition: PlanningPokerTransition) =>
    store.setState(
      (state) => reducePlanningPokerState(state, transition),
      true,
    );

  return {
    setConnectionStatus: (status: ConnectionStatus) =>
      dispatch({ type: "connection-status-changed", status }),
    activateRoom: (roomId: string, savedSession: RoomSession | null) =>
      dispatch({ type: "room-activated", roomId, savedSession }),
    acceptSession: (session: RoomSession, room: Room) =>
      dispatch({ type: "session-accepted", session, room }),
    clearSession: (roomId: string) =>
      dispatch({ type: "session-cleared", roomId }),
    replaceRoom: (room: Room) => dispatch({ type: "room-replaced", room }),
    setError: (error: PublicError) => dispatch({ type: "error-set", error }),
    clearError: () => dispatch({ type: "error-cleared" }),
    resetRoom: (exitReason: RoomExitReason | null = null) =>
      dispatch({ type: "room-reset", exitReason }),
    clearExitReason: () => dispatch({ type: "exit-reason-cleared" }),
  };
};

export type PlanningPokerStateController = ReturnType<
  typeof createPlanningPokerStateController
>;

const emptyParticipants: Record<string, Participant> = {};
const connectionMessages: Record<ConnectionStatus, string> = {
  initial: "Establishing the initial server connection.",
  connected: "The server connection is ready.",
  reconnecting: "The room connection is being restored.",
  "recoverable-error": "The connection was interrupted and can be retried.",
  "session-lost": "The previous participant session can no longer be used.",
  "server-unavailable": "The Planning Poker server is unavailable.",
};
const numericVoteCache = new WeakMap<Record<string, Participant>, number[]>();
const voteInputCache = new WeakMap<Record<string, Participant>, Vote[]>();

export const selectConnectionStatus = (state: PlanningPokerState) =>
  state.connection.status;
export const selectConnectionMessage = (state: PlanningPokerState) =>
  connectionMessages[state.connection.status];
export const selectActiveRoomId = (state: PlanningPokerState) =>
  state.session.activeRoomId;
export const selectHasSession = (state: PlanningPokerState) =>
  state.session.participantId !== null;
export const selectRoom = (state: PlanningPokerState) => state.room.snapshot;
export const selectHasRoom = (state: PlanningPokerState) =>
  state.room.snapshot !== null;
export const selectParticipants = (state: PlanningPokerState) =>
  state.room.snapshot?.participants ?? emptyParticipants;
export const selectRoomValueSet = (state: PlanningPokerState) =>
  state.room.snapshot?.valueSet ?? null;
export const selectRoomRevealed = (state: PlanningPokerState) =>
  state.room.snapshot?.revealed ?? false;
export const selectCurrentParticipantId = (state: PlanningPokerState) =>
  state.session.participantId;
export const selectCurrentParticipant = (
  state: PlanningPokerState,
): Participant | null => {
  const participantId = state.session.participantId;
  return participantId && state.room.snapshot
    ? (state.room.snapshot.participants[participantId] ?? null)
    : null;
};
export const selectHasCurrentParticipant = (state: PlanningPokerState) =>
  selectCurrentParticipant(state) !== null;
export const selectIsModerator = (state: PlanningPokerState) =>
  selectCurrentParticipant(state)?.isModerator ?? false;
export const selectVotedParticipantCount = (state: PlanningPokerState) =>
  Object.values(selectParticipants(state)).filter(
    (participant) => participant.voted,
  ).length;
export const selectCanReveal = (state: PlanningPokerState) =>
  selectIsModerator(state) && selectVotedParticipantCount(state) > 0;
export const selectCanReset = (state: PlanningPokerState) =>
  selectIsModerator(state) && selectVotedParticipantCount(state) > 0;
export const selectCanRevoke = (state: PlanningPokerState) =>
  selectCurrentParticipant(state)?.voted ?? false;
export const selectCurrentVote = (state: PlanningPokerState) =>
  selectCurrentParticipant(state)?.vote;
export const selectNumericStatisticsInputs = (state: PlanningPokerState) => {
  const participants = selectParticipants(state);
  const cached = numericVoteCache.get(participants);
  if (cached) return cached;
  const votes = Object.values(participants)
    .map((participant) => participant.vote)
    .filter((vote): vote is number => typeof vote === "number");
  numericVoteCache.set(participants, votes);
  return votes;
};
export const selectAllVoteInputs = (state: PlanningPokerState): Vote[] => {
  const participants = selectParticipants(state);
  const cached = voteInputCache.get(participants);
  if (cached) return cached;
  const votes = Object.values(participants)
    .map((participant) => participant.vote)
    .filter((vote): vote is Vote => vote !== undefined);
  voteInputCache.set(participants, votes);
  return votes;
};
export const selectError = (state: PlanningPokerState) => state.ui.error;
export const selectErrorMessage = (state: PlanningPokerState) =>
  state.ui.error?.message ?? "";
export const selectExitReason = (state: PlanningPokerState) =>
  state.ui.exitReason;
