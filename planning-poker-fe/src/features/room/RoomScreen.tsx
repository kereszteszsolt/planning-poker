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
  const [serverIsDown, setServerIsDown] = useState(false);

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      setServerIsDown(true);
    }

    socket.on("connect", () => {
      setServerIsDown(false);
      //TODO use rejoin instead of join
      if (currentUser) {
        handleJoin(currentUser.name);
      }
    });

    socket.on("disconnect", () => {
      setServerIsDown(true);
    });

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
      socket.off("connect");
      socket.off("disconnect");
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

  const handleDelegate = (participantId: string) => {
    socket.emit("delegate", { roomId, participantId });
  };

  const handleVote = (value: string | number) => {
    console.log("Voting for:", value);
    socket.emit("vote", { roomId, vote: value });
  };

  const handleRevoke = () => {
    socket.emit("revoke", { roomId });
  };

  const handleReveal = () => {
    socket.emit("reveal", { roomId });
  };

  const handleReset = () => {
    socket.emit("reset", { roomId: roomId });
  };

  const handleChangeValueSet = (valueSet: string) => {
    socket.emit("change-value-set", { roomId, valueSet });
  };

  if (serverIsDown) {
    return <Connecting />;
  }
  if (room && currentUser) {
    return (
      <Play
        room={room}
        currentUser={currentUser}
        kickOut={handleKickOut}
        delegate={handleDelegate}
        vote={handleVote}
        revoke={handleRevoke}
        reveal={handleReveal}
        reset={handleReset}
        changeValueSet={handleChangeValueSet}
      />
    );
  }
  return <Join roomId={roomId!} onJoin={handleJoin} error={error} />;
};

export default RoomScreen;
