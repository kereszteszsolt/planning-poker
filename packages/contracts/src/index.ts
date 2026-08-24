import { z } from "zod";

export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;
export const DEFAULT_MAX_PARTICIPANTS = 20;

export const valueSetNames = ["scrum", "fibonacci", "tshirt", "days"] as const;
export type ValueSet = (typeof valueSetNames)[number];
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

export type Room = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated: number;
};
export type RoomSnapshot = Room;

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
export type AckCallback<T> = (response: Ack<T>) => void;

export const success = <T>(data: T): Ack<T> => ({ ok: true, data });
export const failure = (
  code: ErrorCode,
  message: string,
  recoverable = true,
): Ack<never> => ({ ok: false, error: { code, message, recoverable } });

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hasNoControlCharacters = (value: string) =>
  [...value].every((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint > 31 && (codePoint < 127 || codePoint > 159);
  });

export const roomIdSchema = z.string().trim().regex(uuidV4Pattern);
export const sessionTokenSchema = z.string().trim().regex(uuidV4Pattern);
export const displayNameSchema = z
  .string()
  .trim()
  .min(DISPLAY_NAME_MIN_LENGTH)
  .max(DISPLAY_NAME_MAX_LENGTH)
  .refine(hasNoControlCharacters);
export const valueSetSchema = z.enum(valueSetNames);
export const voteSchema = z.union([z.number().finite(), z.string()]);
export const participantIdSchema = z.string().trim().min(1);

export const createRoomPayloadSchema = z.object({});
export const roomActionPayloadSchema = z.object({ roomId: roomIdSchema });
export const joinRoomPayloadSchema = z
  .object({
    roomId: roomIdSchema,
    name: displayNameSchema,
    sessionToken: sessionTokenSchema.optional(),
  });
export const votePayloadSchema = z
  .object({ roomId: roomIdSchema, vote: voteSchema });
export const changeValueSetPayloadSchema = z
  .object({ roomId: roomIdSchema, valueSet: valueSetSchema });
export const participantTargetPayloadSchema = z
  .object({ roomId: roomIdSchema, participantId: participantIdSchema });

export type CreateRoomPayload = z.infer<typeof createRoomPayloadSchema>;
export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>;
export type RoomActionPayload = z.infer<typeof roomActionPayloadSchema>;
export type VotePayload = z.infer<typeof votePayloadSchema>;
export type ChangeValueSetPayload = z.infer<typeof changeValueSetPayloadSchema>;
export type ParticipantTargetPayload = z.infer<typeof participantTargetPayloadSchema>;

type RoomResult = { room: Room };
export interface ClientToServerEvents {
  "create-room": (payload: CreateRoomPayload, callback: AckCallback<{ roomId: string }>) => void;
  "join-room": (
    payload: JoinRoomPayload,
    callback: AckCallback<{ participant: Participant; sessionToken: string; room: Room }>,
  ) => void;
  vote: (payload: VotePayload, callback: AckCallback<RoomResult>) => void;
  revoke: (payload: RoomActionPayload, callback: AckCallback<RoomResult>) => void;
  reveal: (payload: RoomActionPayload, callback: AckCallback<RoomResult>) => void;
  reset: (payload: RoomActionPayload, callback: AckCallback<RoomResult>) => void;
  "change-value-set": (
    payload: ChangeValueSetPayload,
    callback: AckCallback<RoomResult>,
  ) => void;
  delegate: (payload: ParticipantTargetPayload, callback: AckCallback<RoomResult>) => void;
  "kick-out": (payload: ParticipantTargetPayload, callback: AckCallback<RoomResult>) => void;
  "take-over": (payload: RoomActionPayload, callback: AckCallback<RoomResult>) => void;
  "leave-room": (payload: RoomActionPayload, callback: AckCallback<undefined>) => void;
}

export type ServerNotice = { code: ErrorCode; message: string };
export interface ServerToClientEvents {
  "room-updated": (room: Room) => void;
  "room-closed": (notice: ServerNotice) => void;
  "kicked-out": (notice: ServerNotice) => void;
  "session-replaced": (notice: ServerNotice) => void;
}

export const clientEventSchemas = {
  "create-room": createRoomPayloadSchema,
  "join-room": joinRoomPayloadSchema,
  vote: votePayloadSchema,
  revoke: roomActionPayloadSchema,
  reveal: roomActionPayloadSchema,
  reset: roomActionPayloadSchema,
  "change-value-set": changeValueSetPayloadSchema,
  delegate: participantTargetPayloadSchema,
  "kick-out": participantTargetPayloadSchema,
  "take-over": roomActionPayloadSchema,
  "leave-room": roomActionPayloadSchema,
} as const;
