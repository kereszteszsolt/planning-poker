import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketProvider.tsx";
import Join from "./components/Join.tsx";
import Play from "./components/Play.tsx";
import type { Room, Participant } from "../../shared/types";
import Connecting from "../../shared/components/Connecting.tsx";
import VoteControls from "./components/VoteControls.tsx";
import VotingCards from "./components/VotingCards.tsx";
import { votingValueSets } from "../../shared/constants/voting-value-sets.ts";
import Votes from "./components/Votes.tsx";
import Participants from "./components/Participants.tsx";
import ValueSet from "./components/ValueSet.tsx";

const RoomScreen: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useContext(SocketContext);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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
          setCurrentUserId(response.participant.id);
          setError("");
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

  const nrOfVotedParticipants = useMemo(() => {
    return (
      (room &&
        room.participants &&
        Object.values(room.participants).filter((p) => p.voted).length) ||
      0
    );
  }, [room]);

  const votes = useMemo(() => {
    if (!room) return {};
    const voteMap: Record<string, string | number> = {};
    Object.values(room.participants).forEach((participant) => {
      const vote = participant.vote;
      if (typeof vote === "string" || typeof vote === "number") {
        voteMap[participant.name] = vote;
      }
    });
    return voteMap;
  }, [room]);

  const currentUser = useMemo(() => {
    if (!room || !currentUserId) return null;
    return room.participants[currentUserId] || null;
  }, [room]);

  if (serverIsDown) {
    return <Connecting />;
  }
  if (room && currentUser) {
    return (
      <Play
        room={room}
        currentUser={currentUser}
        changeValueSet={handleChangeValueSet}
      >
        <ValueSet
          currentValueSet={room.valueSet}
          changeValueSet={handleChangeValueSet}
          isModerator={currentUser.isModerator}
        />
        <Participants
          participants={room.participants}
          currentUserId={currentUserId!}
          kickOut={handleKickOut}
          delegate={handleDelegate}
        />
        <Votes votes={votes} isRevealed={room.revealed} />
        <VotingCards
          valueSet={votingValueSets[room.valueSet]}
          onVote={handleVote}
          selectedVote={currentUser.vote}
          disabled={room.revealed}
        />
        <VoteControls
          onReset={handleReset}
          onReveal={handleReveal}
          onRevoke={handleRevoke}
          canReset={nrOfVotedParticipants > 0}
          canReveal={nrOfVotedParticipants > 0}
          canRevoke={currentUser.voted}
          isModerator={currentUser.isModerator}
        />
      </Play>
    );
  }
  return <Join roomId={roomId!} onJoin={handleJoin} error={error} />;
};

export default RoomScreen;
