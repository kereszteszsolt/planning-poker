import express from "express";
import { createServer, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server, type Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import type { RuntimeConfig } from "./config.js";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  failure,
  success,
  valueSets,
  type Ack,
  type Participant,
  type RoomSnapshot,
  type ValueSet,
  type Vote,
} from "./contracts.js";

type ParticipantRecord = Participant & {
  socketId: string;
  sessionToken: string;
  joinedAt: number;
};
type RoomRecord = {
  id: string;
  valueSet: ValueSet;
  participants: Map<string, ParticipantRecord>;
  revealed: boolean;
  lastUpdated: number;
};
type SessionRecord = {
  participant: Participant;
  roomId: string;
  joinedAt: number;
  valueSet: ValueSet;
  expiresAt: number;
};
type SocketMembership = { roomId: string; participantId: string };
type ServerOptions = {
  config: RuntimeConfig;
  now?: () => number;
  httpServer?: HttpServer;
};

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const controlCharacterPattern = /[\u0000-\u001f\u007f-\u009f]/u;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const normalizedName = (name: string) =>
  name.normalize("NFKC").toLocaleLowerCase("en-US");
const publicParticipant = (participant: ParticipantRecord): Participant => ({
  id: participant.id,
  name: participant.name,
  voted: participant.voted,
  ...(participant.vote !== undefined ? { vote: participant.vote } : {}),
  isModerator: participant.isModerator,
});
const snapshot = (room: RoomRecord): RoomSnapshot => ({
  id: room.id,
  valueSet: room.valueSet,
  participants: Object.fromEntries(
    [...room.participants].map(([id, participant]) => [
      id,
      publicParticipant(participant),
    ]),
  ),
  revealed: room.revealed,
  lastUpdated: room.lastUpdated,
});
const ack = <T>(callback: unknown, response: Ack<T>) => {
  if (typeof callback === "function") callback(response);
};
const parseRoomId = (payload: unknown): Ack<string> => {
  if (!isObject(payload) || typeof payload.roomId !== "string") {
    return failure("INVALID_PAYLOAD", "A room ID is required.");
  }
  const roomId = payload.roomId.trim();
  return uuidV4Pattern.test(roomId)
    ? success(roomId)
    : failure("INVALID_ROOM_ID", "Enter a valid room UUID.");
};
const parseName = (value: unknown): Ack<string> => {
  if (typeof value !== "string")
    return failure("INVALID_NAME", "Enter a display name.");
  const name = value.trim();
  if (
    name.length < DISPLAY_NAME_MIN_LENGTH ||
    name.length > DISPLAY_NAME_MAX_LENGTH ||
    controlCharacterPattern.test(name)
  ) {
    return failure(
      "INVALID_NAME",
      `Display names must be ${DISPLAY_NAME_MIN_LENGTH}-${DISPLAY_NAME_MAX_LENGTH} characters and cannot contain control characters.`,
    );
  }
  return success(name);
};

export const createPlanningPokerServer = ({
  config,
  now = Date.now,
  httpServer: suppliedHttpServer,
}: ServerOptions) => {
  const app = express();
  const httpServer = suppliedHttpServer ?? createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: config.allowedOrigins },
    maxHttpBufferSize: config.maxHttpBufferBytes,
    connectionStateRecovery: {
      maxDisconnectionDuration: config.recoveryMaxDisconnectionMs,
      skipMiddlewares: true,
    },
  });
  const rooms = new Map<string, RoomRecord>();
  const sessions = new Map<string, SessionRecord>();
  const touch = (room: RoomRecord) => {
    room.lastUpdated = now();
  };
  const ensureModerator = (room: RoomRecord) => {
    const ordered = [...room.participants.values()].sort(
      (left, right) =>
        left.joinedAt - right.joinedAt || left.id.localeCompare(right.id),
    );
    const moderatorId =
      ordered.find((participant) => participant.isModerator)?.id ??
      ordered[0]?.id;
    for (const participant of ordered)
      participant.isModerator = participant.id === moderatorId;
  };
  const emitRoom = (room: RoomRecord) => {
    ensureModerator(room);
    io.to(room.id).emit("room-updated", snapshot(room));
  };
  const deleteRoomSessions = (roomId: string) => {
    for (const [token, session] of sessions) {
      if (session.roomId === roomId) sessions.delete(token);
    }
  };
  const closeRoom = (room: RoomRecord, inactive: boolean) => {
    if (inactive) {
      io.to(room.id).emit("room-closed", {
        code: "ROOM_NOT_FOUND",
        message: "This room closed after a period of inactivity.",
      });
    }
    rooms.delete(room.id);
    deleteRoomSessions(room.id);
    io.in(room.id).socketsLeave(room.id);
  };
  const removeParticipant = (
    room: RoomRecord,
    participant: ParticipantRecord,
    revokeSession: boolean,
  ) => {
    room.participants.delete(participant.id);
    if (revokeSession) sessions.delete(participant.sessionToken);
    touch(room);
    if (room.participants.size === 0) closeRoom(room, false);
    else emitRoom(room);
  };
  const membership = (
    socket: Socket,
    payload: unknown,
  ): Ack<{ room: RoomRecord; participant: ParticipantRecord }> => {
    const roomId = parseRoomId(payload);
    if (!roomId.ok) return roomId;
    const room = rooms.get(roomId.data);
    if (!room)
      return failure(
        "ROOM_NOT_FOUND",
        "This room does not exist or has expired.",
        false,
      );
    const current = socket.data.membership as SocketMembership | undefined;
    const participant = current
      ? room.participants.get(current.participantId)
      : undefined;
    if (
      !current ||
      current.roomId !== room.id ||
      !participant ||
      participant.socketId !== socket.id
    ) {
      return failure(
        "NOT_A_PARTICIPANT",
        "Join the room before performing this action.",
      );
    }
    return success({ room, participant });
  };
  const moderatorMembership = (
    socket: Socket,
    payload: unknown,
  ): Ack<{ room: RoomRecord; participant: ParticipantRecord }> => {
    const current = membership(socket, payload);
    if (!current.ok) return current;
    return current.data.participant.isModerator
      ? current
      : failure(
          "NOT_AUTHORIZED",
          "Only the moderator can perform this action.",
        );
  };

  io.on("connection", (socket) => {
    socket.on("create-room", (payload: unknown, callback: unknown) => {
      if (!isObject(payload)) {
        ack(
          callback,
          failure("INVALID_PAYLOAD", "Expected an object payload."),
        );
        return;
      }
      const roomId = uuidV4();
      rooms.set(roomId, {
        id: roomId,
        valueSet: "scrum",
        participants: new Map(),
        revealed: false,
        lastUpdated: now(),
      });
      ack(callback, success({ roomId }));
    });

    socket.on("join-room", (payload: unknown, callback: unknown) => {
      const roomId = parseRoomId(payload);
      if (!roomId.ok) return ack(callback, roomId);
      if (!isObject(payload))
        return ack(
          callback,
          failure("INVALID_PAYLOAD", "Expected an object payload."),
        );
      const name = parseName(payload.name);
      if (!name.ok) return ack(callback, name);
      const room = rooms.get(roomId.data);
      if (!room) {
        return ack(
          callback,
          failure(
            "ROOM_NOT_FOUND",
            "This room does not exist or has expired.",
            false,
          ),
        );
      }
      const requestedToken =
        typeof payload.sessionToken === "string"
          ? payload.sessionToken
          : undefined;
      const existingMembership = socket.data.membership as
        | SocketMembership
        | undefined;
      if (existingMembership) {
        const existingParticipant = room.participants.get(
          existingMembership.participantId,
        );
        if (
          existingMembership.roomId === room.id &&
          existingParticipant?.socketId === socket.id &&
          requestedToken === existingParticipant.sessionToken &&
          normalizedName(name.data) === normalizedName(existingParticipant.name)
        ) {
          return ack(
            callback,
            success({
              participant: publicParticipant(existingParticipant),
              sessionToken: existingParticipant.sessionToken,
              room: snapshot(room),
            }),
          );
        }
        return ack(
          callback,
          failure(
            "ALREADY_JOINED",
            "Leave the current room before joining another.",
          ),
        );
      }
      const savedSession = requestedToken
        ? sessions.get(requestedToken)
        : undefined;
      let participant: ParticipantRecord;
      let sessionToken: string;
      if (requestedToken) {
        if (
          !uuidV4Pattern.test(requestedToken) ||
          !savedSession ||
          savedSession.roomId !== room.id
        ) {
          return ack(
            callback,
            failure(
              "INVALID_SESSION",
              "Your room session is no longer valid.",
              false,
            ),
          );
        }
        if (savedSession.expiresAt < now()) {
          sessions.delete(requestedToken);
          return ack(
            callback,
            failure(
              "SESSION_EXPIRED",
              "Your room session expired. Join again.",
              false,
            ),
          );
        }
        if (
          normalizedName(savedSession.participant.name) !==
          normalizedName(name.data)
        ) {
          return ack(
            callback,
            failure(
              "INVALID_SESSION",
              "The saved session does not match this name.",
              false,
            ),
          );
        }
        const connected = room.participants.get(savedSession.participant.id);
        if (!connected && room.participants.size >= config.maxParticipants) {
          return ack(
            callback,
            failure(
              "ROOM_FULL",
              `This room is limited to ${config.maxParticipants} participants.`,
            ),
          );
        }
        if (connected && connected.socketId !== socket.id) {
          const previousSocket = io.sockets.sockets.get(connected.socketId);
          previousSocket?.emit("session-replaced", {
            code: "INVALID_SESSION",
            message: "This room session was resumed in another connection.",
          });
          previousSocket?.leave(room.id);
          if (previousSocket) delete previousSocket.data.membership;
        }
        participant = {
          ...savedSession.participant,
          voted:
            savedSession.valueSet === room.valueSet &&
            savedSession.participant.voted,
          isModerator: false,
          socketId: socket.id,
          sessionToken: requestedToken,
          joinedAt: savedSession.joinedAt,
        };
        if (savedSession.valueSet !== room.valueSet) delete participant.vote;
        sessionToken = requestedToken;
      } else {
        if (room.participants.size >= config.maxParticipants) {
          return ack(
            callback,
            failure(
              "ROOM_FULL",
              `This room is limited to ${config.maxParticipants} participants.`,
            ),
          );
        }
        const activeName = [...room.participants.values()].some(
          (candidate) =>
            normalizedName(candidate.name) === normalizedName(name.data),
        );
        const recoveringName = [...sessions.values()].some(
          (candidate) =>
            candidate.roomId === room.id &&
            candidate.expiresAt >= now() &&
            normalizedName(candidate.participant.name) ===
              normalizedName(name.data),
        );
        if (activeName || recoveringName) {
          return ack(
            callback,
            failure("NAME_TAKEN", `The name "${name.data}" is already in use.`),
          );
        }
        sessionToken = uuidV4();
        participant = {
          id: uuidV4(),
          name: name.data,
          voted: false,
          isModerator: room.participants.size === 0,
          socketId: socket.id,
          sessionToken,
          joinedAt: now(),
        };
      }
      room.participants.set(participant.id, participant);
      sessions.set(sessionToken, {
        participant: publicParticipant(participant),
        roomId: room.id,
        joinedAt: participant.joinedAt,
        valueSet: room.valueSet,
        expiresAt: now() + config.sessionTtlMs,
      });
      socket.data.membership = {
        roomId: room.id,
        participantId: participant.id,
      } satisfies SocketMembership;
      socket.join(room.id);
      touch(room);
      ensureModerator(room);
      emitRoom(room);
      ack(
        callback,
        success({
          participant: publicParticipant(participant),
          sessionToken,
          room: snapshot(room),
        }),
      );
    });

    socket.on("vote", (payload: unknown, callback: unknown) => {
      const current = membership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (!isObject(payload) || !("vote" in payload)) {
        return ack(callback, failure("INVALID_PAYLOAD", "A vote is required."));
      }
      const vote = payload.vote as Vote;
      if (!valueSets[current.data.room.valueSet].includes(vote)) {
        return ack(
          callback,
          failure("INVALID_VOTE", "Choose a value from the active value set."),
        );
      }
      current.data.participant.vote = vote;
      current.data.participant.voted = true;
      current.data.room.revealed = [
        ...current.data.room.participants.values(),
      ].every((participant) => participant.voted);
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("revoke", (payload: unknown, callback: unknown) => {
      const current = membership(socket, payload);
      if (!current.ok) return ack(callback, current);
      current.data.participant.voted = false;
      delete current.data.participant.vote;
      current.data.room.revealed = false;
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("reveal", (payload: unknown, callback: unknown) => {
      const current = moderatorMembership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (
        ![...current.data.room.participants.values()].some(
          (participant) => participant.voted,
        )
      ) {
        return ack(
          callback,
          failure(
            "INVALID_STATE",
            "At least one participant must vote before reveal.",
          ),
        );
      }
      current.data.room.revealed = true;
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("reset", (payload: unknown, callback: unknown) => {
      const current = moderatorMembership(socket, payload);
      if (!current.ok) return ack(callback, current);
      for (const participant of current.data.room.participants.values()) {
        participant.voted = false;
        delete participant.vote;
      }
      current.data.room.revealed = false;
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("change-value-set", (payload: unknown, callback: unknown) => {
      const current = moderatorMembership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (
        !isObject(payload) ||
        typeof payload.valueSet !== "string" ||
        !(payload.valueSet in valueSets)
      ) {
        return ack(
          callback,
          failure("INVALID_VALUE_SET", "Choose a supported value set."),
        );
      }
      current.data.room.valueSet = payload.valueSet as ValueSet;
      for (const participant of current.data.room.participants.values()) {
        participant.voted = false;
        delete participant.vote;
      }
      current.data.room.revealed = false;
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("delegate", (payload: unknown, callback: unknown) => {
      const current = moderatorMembership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (!isObject(payload) || typeof payload.participantId !== "string") {
        return ack(
          callback,
          failure("INVALID_PAYLOAD", "A participant ID is required."),
        );
      }
      if (payload.participantId === current.data.participant.id) {
        return ack(
          callback,
          failure(
            "INVALID_TARGET",
            "Choose another participant for delegation.",
          ),
        );
      }
      const target = current.data.room.participants.get(payload.participantId);
      if (!target) {
        return ack(
          callback,
          failure(
            "PARTICIPANT_NOT_FOUND",
            "That participant is no longer in the room.",
          ),
        );
      }
      for (const participant of current.data.room.participants.values()) {
        participant.isModerator = participant.id === target.id;
      }
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("kick-out", (payload: unknown, callback: unknown) => {
      const current = moderatorMembership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (!isObject(payload) || typeof payload.participantId !== "string") {
        return ack(
          callback,
          failure("INVALID_PAYLOAD", "A participant ID is required."),
        );
      }
      if (payload.participantId === current.data.participant.id) {
        return ack(
          callback,
          failure("INVALID_TARGET", "The moderator cannot remove themselves."),
        );
      }
      const target = current.data.room.participants.get(payload.participantId);
      if (!target) {
        return ack(
          callback,
          failure(
            "PARTICIPANT_NOT_FOUND",
            "That participant is no longer in the room.",
          ),
        );
      }
      const targetSocket = io.sockets.sockets.get(target.socketId);
      targetSocket?.emit("kicked-out", {
        code: "NOT_AUTHORIZED",
        message: "The moderator removed you from this room.",
      });
      targetSocket?.leave(current.data.room.id);
      if (targetSocket) delete targetSocket.data.membership;
      removeParticipant(current.data.room, target, true);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("take-over", (payload: unknown, callback: unknown) => {
      const current = membership(socket, payload);
      if (!current.ok) return ack(callback, current);
      if (
        [...current.data.room.participants.values()].some(
          (participant) => participant.isModerator,
        )
      ) {
        return ack(
          callback,
          failure("INVALID_STATE", "This room already has a moderator."),
        );
      }
      current.data.participant.isModerator = true;
      touch(current.data.room);
      emitRoom(current.data.room);
      ack(callback, success({ room: snapshot(current.data.room) }));
    });

    socket.on("leave-room", (payload: unknown, callback: unknown) => {
      const current = membership(socket, payload);
      if (!current.ok) return ack(callback, current);
      socket.leave(current.data.room.id);
      delete socket.data.membership;
      removeParticipant(current.data.room, current.data.participant, true);
      ack(callback, success(undefined));
    });

    socket.on("disconnect", () => {
      const current = socket.data.membership as SocketMembership | undefined;
      if (!current) return;
      delete socket.data.membership;
      const room = rooms.get(current.roomId);
      const participant = room?.participants.get(current.participantId);
      if (!room || !participant || participant.socketId !== socket.id) return;
      const savedSession = sessions.get(participant.sessionToken);
      if (savedSession) {
        savedSession.participant = publicParticipant(participant);
        savedSession.valueSet = room.valueSet;
        savedSession.expiresAt = now() + config.sessionTtlMs;
      }
      removeParticipant(room, participant, false);
    });
  });

  const runCleanup = () => {
    const currentTime = now();
    for (const room of rooms.values()) {
      if (currentTime - room.lastUpdated >= config.roomTtlMs)
        closeRoom(room, true);
    }
    for (const [token, session] of sessions) {
      if (session.expiresAt < currentTime) sessions.delete(token);
    }
  };
  const cleanupTimer = setInterval(runCleanup, config.cleanupIntervalMs);
  cleanupTimer.unref();
  app.get("/", (_request, response) =>
    response.json({ service: "planning-poker", status: "ok" }),
  );

  return {
    app,
    io,
    rooms,
    sessions,
    runCleanup,
    start: () =>
      new Promise<{ host: string; port: number }>((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(config.port, config.host, () => {
          httpServer.off("error", reject);
          const address = httpServer.address() as AddressInfo;
          resolve({ host: config.host, port: address.port });
        });
      }),
    stop: () =>
      new Promise<void>((resolve, reject) => {
        clearInterval(cleanupTimer);
        io.close(() => {
          if (!httpServer.listening) return resolve();
          httpServer.close((error) => (error ? reject(error) : resolve()));
        });
      }),
  };
};
