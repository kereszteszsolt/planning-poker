import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../../socket-context.ts";
import Connecting from "../../shared/components/Connecting.tsx";
import {
  clearRoomSession,
  readRoomSession,
  writeRoomSession,
  type RoomSession,
} from "../../shared/room-session.ts";
import type { Ack } from "../../shared/socket-contracts.ts";
import type { Participant, Room, ValueSet } from "../../shared/types";
import { votingValueSets } from "../../shared/constants/voting-value-sets.ts";
import Join from "./components/Join.tsx";
import Participants from "./components/Participants.tsx";
import RoomControls from "./components/RoomControls.tsx";
import Statistics from "./components/Statistics.tsx";
import ValueSetControl from "./components/ValueSet.tsx";
import VoteControls from "./components/VoteControls.tsx";
import Votes from "./components/Votes.tsx";
import VotingCards from "./components/VotingCards.tsx";

type RoomAck = Ack<{ room: Room }>;

const RoomScreen: React.FC = () => {
  const { roomId = "" } = useParams<{ roomId: string }>();
  const socketContext = useContext(SocketContext);
  const navigate = useNavigate();
  const initialSession = useMemo(() => readRoomSession(roomId), [roomId]);
  const sessionRef = useRef<RoomSession | null>(initialSession);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    initialSession?.participantId ?? null,
  );
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");

  if (!socketContext)
    throw new Error("RoomScreen must be rendered inside SocketProvider.");
  const { socket, status, retry } = socketContext;

  const forgetSession = useCallback(() => {
    clearRoomSession(roomId);
    sessionRef.current = null;
    setCurrentUserId(null);
    setRoom(null);
  }, [roomId]);

  const acceptJoin = useCallback(
    (
      name: string,
      response: Extract<
        Ack<{ participant: Participant; sessionToken: string; room: Room }>,
        { ok: true }
      >,
    ) => {
      const saved: RoomSession = {
        roomId,
        participantId: response.data.participant.id,
        name,
        sessionToken: response.data.sessionToken,
      };
      writeRoomSession(saved);
      sessionRef.current = saved;
      setCurrentUserId(saved.participantId);
      setRoom(response.data.room);
      setError("");
    },
    [roomId],
  );

  const joinRoom = useCallback(
    (name: string, sessionToken?: string) => {
      setError("");
      socket.emit(
        "join-room",
        { roomId, name: name.trim(), sessionToken },
        (response) => {
          if (response.ok) {
            acceptJoin(name.trim(), response);
            return;
          }
          if (
            sessionToken &&
            ["INVALID_SESSION", "SESSION_EXPIRED", "ROOM_NOT_FOUND"].includes(
              response.error.code,
            )
          ) {
            forgetSession();
          }
          setError(response.error.message);
        },
      );
    },
    [acceptJoin, forgetSession, roomId, socket],
  );

  useEffect(() => {
    const resumeSavedSession = () => {
      const saved = sessionRef.current;
      if (saved) joinRoom(saved.name, saved.sessionToken);
    };
    const handleRoomUpdated = (nextRoom: Room) => setRoom(nextRoom);
    const handleRoomClosed = () => {
      forgetSession();
      navigate("/message/closed");
    };
    const handleKickedOut = () => {
      forgetSession();
      navigate("/message/kicked-out");
    };
    const handleSessionReplaced = () => {
      forgetSession();
      navigate("/message/session-replaced");
    };

    socket.on("connect", resumeSavedSession);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("room-closed", handleRoomClosed);
    socket.on("kicked-out", handleKickedOut);
    socket.on("session-replaced", handleSessionReplaced);
    if (socket.connected) resumeSavedSession();

    return () => {
      socket.off("connect", resumeSavedSession);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("room-closed", handleRoomClosed);
      socket.off("kicked-out", handleKickedOut);
      socket.off("session-replaced", handleSessionReplaced);
    };
  }, [forgetSession, joinRoom, navigate, socket]);

  const applyRoomAck = (response: RoomAck) => {
    if (response.ok) {
      setRoom(response.data.room);
      setError("");
    } else {
      setError(response.error.message);
    }
  };
  const handleKickOut = (participantId: string) =>
    socket.emit("kick-out", { roomId, participantId }, applyRoomAck);
  const handleDelegate = (participantId: string) =>
    socket.emit("delegate", { roomId, participantId }, applyRoomAck);
  const handleVote = (vote: string | number) =>
    socket.emit("vote", { roomId, vote }, applyRoomAck);
  const handleRevoke = () => socket.emit("revoke", { roomId }, applyRoomAck);
  const handleReveal = () => socket.emit("reveal", { roomId }, applyRoomAck);
  const handleReset = () => socket.emit("reset", { roomId }, applyRoomAck);
  const handleChangeValueSet = (valueSet: ValueSet) =>
    socket.emit("change-value-set", { roomId, valueSet }, applyRoomAck);
  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId }, (response) => {
      if (!response.ok) {
        setError(response.error.message);
        return;
      }
      forgetSession();
      navigate("/");
    });
  };

  const votedParticipantCount = useMemo(
    () =>
      room
        ? Object.values(room.participants).filter(
            (participant) => participant.voted,
          ).length
        : 0,
    [room],
  );
  const currentUser = useMemo(
    () =>
      room && currentUserId ? (room.participants[currentUserId] ?? null) : null,
    [currentUserId, room],
  );

  if (status !== "connected")
    return <Connecting status={status} onRetry={retry} />;
  if (sessionRef.current && !room) return <Connecting status="reconnecting" />;

  if (room && currentUser) {
    return (
      <div
        className="flex flex-col md:flex-row justify-center items-start w-full gap-4 p-2 md:p-4"
        style={{ minHeight: "calc(100vh - 64px)", background: "#f8fbff" }}
      >
        <div className="flex flex-col w-full md:w-3/4 lg:w-2/3 xl:w-1/2 gap-4">
          {error && (
            <p className="p-3 rounded bg-red-50 text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="p-4 md:p-6 bg-white rounded-lg shadow w-full">
            <ValueSetControl
              currentValueSet={room.valueSet}
              changeValueSet={handleChangeValueSet}
              isModerator={currentUser.isModerator}
            />
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
              canReset={votedParticipantCount > 0}
              canReveal={votedParticipantCount > 0}
              canRevoke={currentUser.voted}
              isModerator={currentUser.isModerator}
            />
          </div>
          <div className="flex flex-col p-4 md:p-6 bg-white rounded-lg shadow w-full gap-4">
            <Votes
              participants={room.participants}
              isRevealed={room.revealed}
            />
            <Statistics
              participants={room.participants}
              isRevealed={room.revealed}
            />
          </div>
        </div>
        <div className="flex flex-col w-full md:w-1/4 lg:w-1/3 xl:w-1/4 gap-4">
          <RoomControls roomId={room.id} onLeave={handleLeaveRoom} />
          <Participants
            participants={room.participants}
            currentUserId={currentUser.id}
            kickOut={handleKickOut}
            delegate={handleDelegate}
          />
        </div>
      </div>
    );
  }

  return (
    <Join roomId={roomId} onJoin={(name) => joinRoom(name)} error={error} />
  );
};

export default RoomScreen;
