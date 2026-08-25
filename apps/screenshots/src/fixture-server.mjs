import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import {
  createFixtureRooms,
  findParticipantByName,
  fixedTime,
  roomIds,
  sessionTokenFor,
} from "./fixtures.mjs";

const host = "127.0.0.1";
const port = 4173;
const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDistDirectory = path.resolve(sourceDirectory, "../../web/dist");
const indexPath = path.join(webDistDirectory, "index.html");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { serveClient: false });
const rooms = createFixtureRooms();
let updateSequence = 0;

const success = (data) => ({ ok: true, data });
const failure = (code, message, recoverable = true) => ({
  ok: false,
  error: { code, message, recoverable },
});
const clone = (value) => structuredClone(value);
const touch = (room) => {
  updateSequence += 1;
  room.lastUpdated = fixedTime + updateSequence;
};
const roomForSocket = (socket, payload) => {
  const room = rooms.get(payload?.roomId);
  const participant = room?.participants[socket.data.participantId];
  return room && participant ? { room, participant } : null;
};
const roomAck = (room) => success({ room: clone(room) });
const publish = (room) => io.to(room.id).emit("room-updated", clone(room));

io.on("connection", (socket) => {
  socket.on("create-room", (_payload, callback) =>
    callback(success({ roomId: roomIds.create })),
  );

  socket.on("join-room", (payload, callback) => {
    const room = rooms.get(payload?.roomId);
    if (!room) {
      callback(
        failure(
          "ROOM_NOT_FOUND",
          "This invented screenshot room is not available.",
          false,
        ),
      );
      return;
    }
    const participant = findParticipantByName(room, payload?.name ?? "");
    if (!participant) {
      callback(
        failure("INVALID_NAME", "Use one of the committed fixture names."),
      );
      return;
    }
    socket.data.participantId = participant.id;
    socket.data.roomId = room.id;
    socket.join(room.id);
    callback(
      success({
        participant: clone(participant),
        sessionToken: sessionTokenFor(participant.id),
        room: clone(room),
      }),
    );
  });

  socket.on("vote", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current) {
      callback(failure("NOT_A_PARTICIPANT", "Join the fixture room first."));
      return;
    }
    current.participant.voted = true;
    current.participant.vote = payload.vote;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("revoke", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current) {
      callback(failure("NOT_A_PARTICIPANT", "Join the fixture room first."));
      return;
    }
    current.participant.voted = false;
    delete current.participant.vote;
    current.room.revealed = false;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("reveal", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current?.participant.isModerator) {
      callback(
        failure("NOT_AUTHORIZED", "Only the fixture moderator can reveal."),
      );
      return;
    }
    current.room.revealed = true;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("reset", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current?.participant.isModerator) {
      callback(
        failure("NOT_AUTHORIZED", "Only the fixture moderator can reset."),
      );
      return;
    }
    for (const participant of Object.values(current.room.participants)) {
      participant.voted = false;
      delete participant.vote;
    }
    current.room.revealed = false;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("change-value-set", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current?.participant.isModerator) {
      callback(
        failure(
          "NOT_AUTHORIZED",
          "Only the fixture moderator can change sets.",
        ),
      );
      return;
    }
    current.room.valueSet = payload.valueSet;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("delegate", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    const target = current?.room.participants[payload?.participantId];
    if (!current?.participant.isModerator || !target) {
      callback(failure("INVALID_TARGET", "Choose a fixture participant."));
      return;
    }
    for (const participant of Object.values(current.room.participants))
      participant.isModerator = participant.id === target.id;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("kick-out", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    const target = current?.room.participants[payload?.participantId];
    if (!current?.participant.isModerator || !target) {
      callback(failure("INVALID_TARGET", "Choose a fixture participant."));
      return;
    }
    delete current.room.participants[target.id];
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("take-over", (payload, callback) => {
    const current = roomForSocket(socket, payload);
    if (!current) {
      callback(failure("NOT_A_PARTICIPANT", "Join the fixture room first."));
      return;
    }
    current.participant.isModerator = true;
    touch(current.room);
    publish(current.room);
    callback(roomAck(current.room));
  });

  socket.on("leave-room", (_payload, callback) => callback(success(undefined)));
});

app.post("/__pp_screenshots__/disconnect", (_request, response) => {
  io.disconnectSockets(true);
  response.status(204).end();
});
app.use(express.static(webDistDirectory, { index: false }));
app.use((_request, response) => response.sendFile(indexPath));

const shutdown = () => io.close(() => httpServer.close(() => process.exit(0)));

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
httpServer.listen(port, host, () => {
  console.log(`PP-009 fixture listening on http://${host}:${port}`);
});
