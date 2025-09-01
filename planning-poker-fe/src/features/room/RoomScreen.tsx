import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketProvider.tsx";
import Join from "./components/Join.tsx";
import Play from "./components/Play.tsx";
import type { Room, Participant } from "../../shared/types";
import Connecting from "../../shared/components/Connecting.tsx";

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

  if (!socket || !socket.connected) {
    return <Connecting />;
  }
  if (room && currentUser) {
    return (
      <Play room={room} currentUser={currentUser} kickOut={handleKickOut} />
    );
  }
  return <Join roomId={roomId!} onJoin={handleJoin} error={error} />;
};

export default RoomScreen;
