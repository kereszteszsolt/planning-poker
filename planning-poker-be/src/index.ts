import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const port = 3000;

type ValueSet = "scrum" | "fibonacci" | "tshirt" | "days";

const valueSets: Record<ValueSet, Array<number | string>> = {
  scrum: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?", "∞", "☕"],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "∞", "☕"],
  days: [0.5, 1, 2, 3, 4, 5, 10, 15, 20, 30, "?", "∞", "☕"],
};

type Participant = {
  id: string;
  name: string;
  voted: boolean;
  vote?: number | string;
  isModerator: boolean;
};

type Room = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated?: number;
};

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  socket.on("create-room", (_, callback) => {
    const roomId = uuidV4();
    rooms[roomId] = {
      id: roomId,
      valueSet: "scrum",
      participants: {},
      revealed: false,
      lastUpdated: Date.now(),
    };
    callback({ roomId });
  });

  socket.on(
    "join-room",
    ({ roomId, name }: { roomId: string; name: string }, callback) => {
      console.log(`join-room: ${roomId}`);
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          valueSet: "scrum",
          participants: {},
          revealed: false,
          lastUpdated: Date.now(),
        };
      }
      // if name already taken
      for (const participantId in rooms[roomId].participants) {
        if (rooms[roomId].participants[participantId].name === name) {
          callback({ error: `Name "${name}" already taken in this room.` });
          return;
        }
      }
      const isModerator = Object.keys(rooms[roomId].participants).length === 0;
      rooms[roomId].participants[socket.id] = {
        id: socket.id,
        name,
        voted: false,
        isModerator,
      };
      rooms[roomId].lastUpdated = Date.now();
      socket.join(roomId);
      io.to(roomId).emit("room-updated", rooms[roomId]);
      callback({
        participant: rooms[roomId].participants[socket.id],
      });
    },
  );

  socket.on("kick-out", ({ roomId, participantId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const requester = room.participants[socket.id];
    if (!requester || !requester.isModerator) return; // Only moderator can kick

    if (room.participants[participantId]) {
      // Notify the kicked participant
      //get socket by id and emit
      io.to(participantId).emit("kicked-out");
      console.log(
        `Participant ${participantId} kicked out from room ${roomId}`,
      );
      // Remove from room
      delete room.participants[participantId];
      room.lastUpdated = Date.now();
      io.to(roomId).emit("room-updated", room);

      // // Forcefully disconnect the kicked socket from the room
      // const kickedSocket = io.sockets.sockets.get(participantId);
      // kickedSocket?.leave(roomId);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].participants[socket.id]) {
        delete rooms[roomId].participants[socket.id];

        if (Object.keys(rooms[roomId].participants).length > 0) {
          io.to(roomId).emit("room-updated", rooms[roomId]);
        } else {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const roomId in rooms) {
    if (
      rooms[roomId].lastUpdated &&
      now - rooms[roomId].lastUpdated > 3600000
    ) {
      console.log("now", now);
      // 3600000 1 hour
      delete rooms[roomId];
      io.to(roomId).emit("room-closed");

      // Forcefully disconnect all sockets in the room
      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients) {
        for (const socketId of clients) {
          const socket = io.sockets.sockets.get(socketId);
          socket?.leave(roomId);
        }
      }
    }
  }
}, 600000);
// Check every 10 minutes  600000

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
