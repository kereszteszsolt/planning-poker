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
};

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  socket.on("create-room", () => {
    const roomId = uuidV4();
    rooms[roomId] = {
      id: roomId,
      valueSet: "scrum",
      participants: {},
      revealed: false,
    };
    socket.emit("room-created", roomId);
  });

  socket.on(
    "join-room",
    ({ roomId, name }: { roomId: string; name: string }) => {
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          valueSet: "scrum",
          participants: {},
          revealed: false,
        };
      }
      const isModerator = Object.keys(rooms[roomId].participants).length === 0;
      rooms[roomId].participants[socket.id] = {
        id: socket.id,
        name,
        voted: false,
        isModerator,
      };
      socket.join(roomId);
      io.to(roomId).emit("room-updated", rooms[roomId]);
    },
  );

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
