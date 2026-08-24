export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;
export const DEFAULT_MAX_PARTICIPANTS = 20;

export type ValueSet = "scrum" | "fibonacci" | "tshirt" | "days";
export type Vote = number | string;

export const valueSets: Record<ValueSet, Vote[]> = {
  scrum: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?", "∞", "☕"],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "∞", "☕"],
  days: [0.5, 1, 2, 3, 4, 5, 10, 15, 20, 30, "?", "∞", "☕"],
};

export type Participant = {
  id: string;
  name: string;
  voted: boolean;
  vote?: Vote;
  isModerator: boolean;
};

export type RoomSnapshot = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated: number;
};

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

export const success = <T>(data: T): Ack<T> => ({ ok: true, data });

export const failure = (
  code: ErrorCode,
  message: string,
  recoverable = true,
): Ack<never> => ({
  ok: false,
  error: { code, message, recoverable },
});
