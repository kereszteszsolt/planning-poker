import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../SocketProvider.tsx";

type Participant = {
  id: string;
  name: string;
  isModerator: boolean;
};

type roomState = "joining" | "joined";

const RoomScreen: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useContext(SocketContext);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [state, setState] = useState<roomState>("joining");
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);

  useEffect(() => {
    if (!socket) return;

    setMyId(socket.id);

    socket.on("room-updated", (room) => {
      setParticipants(Object.values(room.participants));
      if (state === "joined") return;
      setState("joined");
    });

    socket.on("room-closed", () => {
      navigate("/message/closed");
    });

    socket.on("kicked-out", () => {
      navigate("/message/kicked-out");
    });

    return () => {
      socket.off("room-updated");
      socket.off("room-closed");
      socket.off("kicked-out");
    };
  }, [socket]);

  const handleJoin = () => {
    if (!name.trim()) return;
    socket.emit(
      "join-room",
      { roomId, name: name.trim() },
      (response: { participant?: Participant; error?: string }) => {
        if (response?.error) {
          setError(response.error);
        }
        if (response?.participant) {
          setError("");
          setState("joined");
          setCurrentUser(response.participant);
          setMyId(response.participant.id);
        }
      },
    );
  };

  const handleKickOut = (participantId: string) => {
    socket.emit("kick-out", { roomId, participantId });
  };

  if (state === "joining") {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Join Room</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleJoin}
          className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          Join
        </button>
        {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
      </div>
    );
  }

  // state === "joined"
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2 text-center">Room: {roomId}</h1>
      <h2 className="text-lg mb-4 text-center">Your name: {name}</h2>
      <h3 className="font-semibold mb-2">Participants:</h3>
      <ul className="mb-2">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between p-2 border-b last:border-b-0"
          >
            <span>
              {p.name}
              {p.isModerator ? " (moderator)" : ""}
              {p.id === myId ? " (you)" : ""}
              {p.id}
            </span>
            {currentUser &&
              currentUser.isModerator &&
              p.id !== currentUser.id && (
                <button
                  onClick={() => handleKickOut(p.id)}
                  className="ml-2 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  Kick
                </button>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomScreen;
