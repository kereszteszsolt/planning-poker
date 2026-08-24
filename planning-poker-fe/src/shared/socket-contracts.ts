import type { Participant, Room, ValueSet } from "./types";

export type ErrorCode =
  | "INVALID_PAYLOAD"
  | "INVALID_ROOM_ID"
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "INVALID_NAME"
  | "NAME_TAKEN"
  | "INVALID_SESSION"
  | "SESSION_EXPIRED"
  | "ALREADY_JOINED"
  | "NOT_A_PARTICIPANT"
  | "NOT_AUTHORIZED"
  | "INVALID_VOTE"
  | "INVALID_VALUE_SET"
  | "PARTICIPANT_NOT_FOUND"
  | "INVALID_TARGET"
  | "INVALID_STATE"
  | "SERVER_ERROR";

export type PublicError = {
  code: ErrorCode;
  message: string;
  recoverable: boolean;
};
export type Ack<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: PublicError };
type AckCallback<T> = (response: Ack<T>) => void;
type RoomResult = { room: Room };

export interface ClientToServerEvents {
  "create-room": (
    payload: Record<string, never>,
    callback: AckCallback<{ roomId: string }>,
  ) => void;
  "join-room": (
    payload: { roomId: string; name: string; sessionToken?: string },
    callback: AckCallback<{
      participant: Participant;
      sessionToken: string;
      room: Room;
    }>,
  ) => void;
  vote: (
    payload: { roomId: string; vote: number | string },
    callback: AckCallback<RoomResult>,
  ) => void;
  revoke: (
    payload: { roomId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  reveal: (
    payload: { roomId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  reset: (
    payload: { roomId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  "change-value-set": (
    payload: { roomId: string; valueSet: ValueSet },
    callback: AckCallback<RoomResult>,
  ) => void;
  delegate: (
    payload: { roomId: string; participantId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  "kick-out": (
    payload: { roomId: string; participantId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  "take-over": (
    payload: { roomId: string },
    callback: AckCallback<RoomResult>,
  ) => void;
  "leave-room": (
    payload: { roomId: string },
    callback: AckCallback<undefined>,
  ) => void;
}

export type ServerNotice = { code: ErrorCode; message: string };
export interface ServerToClientEvents {
  "room-updated": (room: Room) => void;
  "room-closed": (notice: ServerNotice) => void;
  "kicked-out": (notice: ServerNotice) => void;
  "session-replaced": (notice: ServerNotice) => void;
}

export type ConnectionStatus =
  | "initial"
  | "connected"
  | "reconnecting"
  | "recoverable-error"
  | "session-lost"
  | "server-unavailable";
