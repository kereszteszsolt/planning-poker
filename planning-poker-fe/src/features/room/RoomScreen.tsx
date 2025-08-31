import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketProvider.tsx";
import Join from "./components/Join.tsx";
import Play from "./components/Play.tsx";

type Participant = {
  id: string;
  name: string;
  voted: boolean;
  vote?: number | string;
  isModerator: boolean;
};

type ValueSet = "scrum" | "fibonacci" | "tshirt" | "days";

const valueSets: Record<ValueSet, Array<number | string>> = {
  scrum: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?", "∞", "☕"],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "∞", "☕"],
  days: [0.5, 1, 2, 3, 4, 5, 10, 15, 20, 30, "?", "∞", "☕"],
};

type Room = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated?: number;
};

const RoomScreen: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useContext(SocketContext);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<Participant | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-updated", (room: Room) => {
      setRoom(room);
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

  const handleJoin = (name: string) => {
    socket.emit(
      "join-room",
      { roomId, name: name.trim() },
      (response: { participant?: Participant; error?: string }) => {
        if (response?.error) {
          setError(response.error);
        }
        if (response?.participant) {
          setError("");
          setCurrentUser(response.participant);
        }
      },
    );
  };

  const handleKickOut = (participantId: string) => {
    socket.emit("kick-out", { roomId, participantId });
  };

  if (room && currentUser) {
    return (
      <Play room={room} currentUser={currentUser} kickOut={handleKickOut} />
    );
  }
  return <Join roomId={roomId!} onJoin={handleJoin} error={error} />;
};

export default RoomScreen;
