import type {
  Ack,
  PublicError,
  Room,
  ValueSet,
  Vote,
} from "@planning-poker/contracts";
import type { ApplicationSocket } from "../socket-types";
import {
  clearRoomSession,
  readRoomSession,
  writeRoomSession,
  type RoomSession,
} from "../shared/room-session";
import {
  createPlanningPokerStateController,
  type PlanningPokerStore,
  type RoomExitReason,
} from "../state/planning-poker-store";

type RoomAck = Ack<{ room: Room }>;

export type RoomSessionRepository = {
  read: (roomId: string) => RoomSession | null;
  write: (session: RoomSession) => void;
  clear: (roomId: string) => void;
};

const browserSessionRepository: RoomSessionRepository = {
  read: readRoomSession,
  write: writeRoomSession,
  clear: clearRoomSession,
};

const networkError = (): PublicError => ({
  code: "SERVER_ERROR",
  message: "The server request could not be sent. Please try again.",
  recoverable: true,
});

const invalidSessionCodes = new Set([
  "INVALID_SESSION",
  "SESSION_EXPIRED",
  "ROOM_NOT_FOUND",
]);

export interface PlanningPokerTransport {
  start: () => () => void;
  activateRoom: (roomId: string) => void;
  createRoom: () => Promise<string | null>;
  joinRoom: (name: string) => void;
  vote: (vote: Vote) => void;
  revoke: () => void;
  reveal: () => void;
  reset: () => void;
  changeValueSet: (valueSet: ValueSet) => void;
  delegate: (participantId: string) => void;
  kickOut: (participantId: string) => void;
  leaveRoom: () => Promise<boolean>;
  returnHome: () => void;
  retryConnection: () => void;
}

type PlanningPokerTransportOptions = {
  socket: ApplicationSocket;
  store: PlanningPokerStore;
  sessionRepository?: RoomSessionRepository;
};

class SocketPlanningPokerTransport implements PlanningPokerTransport {
  private readonly socket: ApplicationSocket;
  private readonly store: PlanningPokerStore;
  private readonly state;
  private readonly sessions: RoomSessionRepository;
  private started = false;
  private connectedOnce = false;
  private connectionGeneration = 0;
  private lastResumeKey: string | null = null;

  constructor({
    socket,
    store,
    sessionRepository = browserSessionRepository,
  }: PlanningPokerTransportOptions) {
    this.socket = socket;
    this.store = store;
    this.state = createPlanningPokerStateController(store);
    this.sessions = sessionRepository;
  }

  private handleConnect = () => {
    this.connectedOnce = true;
    this.connectionGeneration += 1;
    this.state.setConnectionStatus("connected");
    this.resumeSavedSession();
  };

  private handleDisconnect = (reason: string) => {
    if (reason === "io server disconnect") {
      this.clearActiveSession();
      this.state.setConnectionStatus("session-lost");
      return;
    }
    this.state.setConnectionStatus("reconnecting");
  };

  private handleConnectError = () => {
    this.state.setConnectionStatus(
      this.connectedOnce ? "recoverable-error" : "server-unavailable",
    );
  };

  private handleReconnectAttempt = () =>
    this.state.setConnectionStatus("reconnecting");

  private handleReconnectError = () =>
    this.state.setConnectionStatus("recoverable-error");

  private handleReconnectFailed = () =>
    this.state.setConnectionStatus("server-unavailable");

  private handleRoomUpdated = (room: Room) => this.state.replaceRoom(room);

  private handleRoomClosed = () => this.handleForcedExit("closed");

  private handleKickedOut = () => this.handleForcedExit("kicked-out");

  private handleSessionReplaced = () =>
    this.handleForcedExit("session-replaced");

  start = () => {
    if (this.started) return () => undefined;
    this.started = true;
    this.socket.on("connect", this.handleConnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("connect_error", this.handleConnectError);
    this.socket.on("room-updated", this.handleRoomUpdated);
    this.socket.on("room-closed", this.handleRoomClosed);
    this.socket.on("kicked-out", this.handleKickedOut);
    this.socket.on("session-replaced", this.handleSessionReplaced);
    this.socket.io.on("reconnect_attempt", this.handleReconnectAttempt);
    this.socket.io.on("reconnect_error", this.handleReconnectError);
    this.socket.io.on("reconnect_failed", this.handleReconnectFailed);
    if (this.socket.connected) this.handleConnect();
    else this.socket.connect();
    return this.stop;
  };

  private stop = () => {
    if (!this.started) return;
    this.started = false;
    this.socket.off("connect", this.handleConnect);
    this.socket.off("disconnect", this.handleDisconnect);
    this.socket.off("connect_error", this.handleConnectError);
    this.socket.off("room-updated", this.handleRoomUpdated);
    this.socket.off("room-closed", this.handleRoomClosed);
    this.socket.off("kicked-out", this.handleKickedOut);
    this.socket.off("session-replaced", this.handleSessionReplaced);
    this.socket.io.off("reconnect_attempt", this.handleReconnectAttempt);
    this.socket.io.off("reconnect_error", this.handleReconnectError);
    this.socket.io.off("reconnect_failed", this.handleReconnectFailed);
    this.socket.disconnect();
  };

  activateRoom = (roomId: string) => {
    const previousRoomId = this.store.getState().session.activeRoomId;
    if (previousRoomId !== roomId) this.lastResumeKey = null;
    this.state.activateRoom(roomId, this.sessions.read(roomId));
    if (this.started && this.socket.connected) this.resumeSavedSession();
  };

  private resumeSavedSession = () => {
    const session = this.store.getState().session;
    if (
      !session.activeRoomId ||
      !session.participantId ||
      !session.displayName ||
      !session.sessionToken
    ) {
      return;
    }
    const resumeKey = `${this.connectionGeneration}:${session.activeRoomId}:${session.sessionToken}`;
    if (this.lastResumeKey === resumeKey) return;
    this.lastResumeKey = resumeKey;
    this.emitJoin(
      session.activeRoomId,
      session.displayName,
      session.sessionToken,
    );
  };

  createRoom = () => {
    this.state.clearError();
    return new Promise<string | null>((resolve) => {
      try {
        this.socket.emit("create-room", {}, (response) => {
          if (response.ok) resolve(response.data.roomId);
          else {
            this.state.setError(response.error);
            resolve(null);
          }
        });
      } catch {
        this.state.setError(networkError());
        resolve(null);
      }
    });
  };

  joinRoom = (name: string) => {
    const roomId = this.store.getState().session.activeRoomId;
    if (!roomId) return;
    this.lastResumeKey = null;
    this.state.clearError();
    this.emitJoin(roomId, name.trim());
  };

  private emitJoin = (roomId: string, name: string, sessionToken?: string) => {
    try {
      this.socket.emit(
        "join-room",
        { roomId, name, sessionToken },
        (response) => {
          if (response.ok) {
            const session: RoomSession = {
              roomId,
              participantId: response.data.participant.id,
              name,
              sessionToken: response.data.sessionToken,
            };
            this.sessions.write(session);
            this.state.acceptSession(session, response.data.room);
            return;
          }
          if (sessionToken && invalidSessionCodes.has(response.error.code)) {
            this.sessions.clear(roomId);
            this.state.clearSession(roomId);
          }
          this.state.setError(response.error);
        },
      );
    } catch {
      this.state.setError(networkError());
    }
  };

  private activeRoomId = () => this.store.getState().session.activeRoomId;

  private applyRoomAck = (response: RoomAck) => {
    if (response.ok) {
      this.state.clearError();
      this.state.replaceRoom(response.data.room);
    } else this.state.setError(response.error);
  };

  private emitRoomAction = (event: "revoke" | "reveal" | "reset") => {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    try {
      this.socket.emit(event, { roomId }, this.applyRoomAck);
    } catch {
      this.state.setError(networkError());
    }
  };

  vote = (vote: Vote) => {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    try {
      this.socket.emit("vote", { roomId, vote }, this.applyRoomAck);
    } catch {
      this.state.setError(networkError());
    }
  };

  revoke = () => this.emitRoomAction("revoke");
  reveal = () => this.emitRoomAction("reveal");
  reset = () => this.emitRoomAction("reset");

  changeValueSet = (valueSet: ValueSet) => {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    try {
      this.socket.emit(
        "change-value-set",
        { roomId, valueSet },
        this.applyRoomAck,
      );
    } catch {
      this.state.setError(networkError());
    }
  };

  private emitParticipantAction = (
    event: "delegate" | "kick-out",
    participantId: string,
  ) => {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    try {
      this.socket.emit(event, { roomId, participantId }, this.applyRoomAck);
    } catch {
      this.state.setError(networkError());
    }
  };

  delegate = (participantId: string) =>
    this.emitParticipantAction("delegate", participantId);

  kickOut = (participantId: string) =>
    this.emitParticipantAction("kick-out", participantId);

  leaveRoom = () => {
    const roomId = this.activeRoomId();
    if (!roomId) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      try {
        this.socket.emit("leave-room", { roomId }, (response) => {
          if (!response.ok) {
            this.state.setError(response.error);
            resolve(false);
            return;
          }
          this.sessions.clear(roomId);
          this.lastResumeKey = null;
          this.state.resetRoom();
          resolve(true);
        });
      } catch {
        this.state.setError(networkError());
        resolve(false);
      }
    });
  };

  returnHome = () => {
    const roomId = this.activeRoomId();
    const hasParticipant = this.store.getState().session.participantId !== null;
    if (roomId) {
      this.sessions.clear(roomId);
      if (hasParticipant) {
        try {
          this.socket.emit("leave-room", { roomId }, () => undefined);
        } catch {
          // Local privacy reset must still complete if the transport is gone.
        }
      }
    }
    this.lastResumeKey = null;
    this.state.resetRoom();
  };

  retryConnection = () => {
    this.state.setConnectionStatus("reconnecting");
    this.socket.connect();
  };

  private clearActiveSession = () => {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    this.sessions.clear(roomId);
    this.lastResumeKey = null;
    this.state.clearSession(roomId);
  };

  private handleForcedExit = (exitReason: RoomExitReason) => {
    const roomId = this.activeRoomId();
    if (roomId) this.sessions.clear(roomId);
    this.lastResumeKey = null;
    this.state.resetRoom(exitReason);
  };
}

export const createPlanningPokerTransport = (
  options: PlanningPokerTransportOptions,
): PlanningPokerTransport => new SocketPlanningPokerTransport(options);
