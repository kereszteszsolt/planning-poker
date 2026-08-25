import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Connecting from "../../shared/components/Connecting.tsx";
import {
  selectConnectionStatus,
  selectErrorMessage,
  selectExitReason,
  selectHasCurrentParticipant,
  selectHasRoom,
  selectHasSession,
} from "../../state/planning-poker-store.ts";
import { usePlanningPokerSelector } from "../../state/planning-poker-store-context.ts";
import { usePlanningPokerTransport } from "../../transport/transport-context.ts";
import Join from "./components/Join.tsx";
import RoomView from "./RoomView.tsx";

const RoomScreen: React.FC = () => {
  const { roomId = "" } = useParams<{ roomId: string }>();
  const transport = usePlanningPokerTransport();
  const navigate = useNavigate();
  const status = usePlanningPokerSelector(selectConnectionStatus);
  const hasSession = usePlanningPokerSelector(selectHasSession);
  const hasRoom = usePlanningPokerSelector(selectHasRoom);
  const hasCurrentParticipant = usePlanningPokerSelector(
    selectHasCurrentParticipant,
  );
  const error = usePlanningPokerSelector(selectErrorMessage);
  const exitReason = usePlanningPokerSelector(selectExitReason);

  useEffect(() => transport.activateRoom(roomId), [roomId, transport]);

  useEffect(() => {
    if (exitReason) navigate(`/message/${exitReason}`, { replace: true });
  }, [exitReason, navigate]);

  const handleLeaveRoom = useCallback(async () => {
    if (await transport.leaveRoom()) navigate("/");
  }, [navigate, transport]);

  if (status !== "connected")
    return <Connecting status={status} onRetry={transport.retryConnection} />;
  if (hasSession && !hasRoom) return <Connecting status="reconnecting" />;

  if (hasRoom && hasCurrentParticipant) {
    return (
      <>
        {error && (
          <p className="p-3 rounded bg-red-50 text-red-700" role="alert">
            {error}
          </p>
        )}
        <RoomView onLeave={handleLeaveRoom} />
      </>
    );
  }

  return <Join roomId={roomId} onJoin={transport.joinRoom} error={error} />;
};

export default RoomScreen;
