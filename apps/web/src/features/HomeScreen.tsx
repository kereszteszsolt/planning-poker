import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Connecting from "../shared/components/Connecting.tsx";
import {
  selectConnectionStatus,
  selectErrorMessage,
} from "../state/planning-poker-store.ts";
import { usePlanningPokerSelector } from "../state/planning-poker-store-context.ts";
import { usePlanningPokerTransport } from "../transport/transport-context.ts";

const HomeScreen: React.FC = () => {
  const transport = usePlanningPokerTransport();
  const status = usePlanningPokerSelector(selectConnectionStatus);
  const error = usePlanningPokerSelector(selectErrorMessage);
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => transport.returnHome(), [transport]);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const roomId = await transport.createRoom();
      if (roomId) navigate(`/room/${roomId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`);
    }
  };

  const isJoinDisabled = !joinRoomId.trim();

  if (status !== "connected") {
    return <Connecting status={status} onRetry={transport.retryConnection} />;
  }
  return (
    <main className="pp-page pp-page-centered">
      <section className="pp-panel pp-form-panel" aria-labelledby="home-title">
        <h1 id="home-title" className="pp-title text-center">
          Planning Poker
        </h1>
        <p className="pp-copy text-center">Estimate. Discuss. Align.</p>
        <p className="pp-copy text-center">
          Create a room or join your team with a room ID.
        </p>
        {error && (
          <p className="pp-error mt-4" role="alert">
            {error}
          </p>
        )}
        <div className="pp-form-actions">
          <button
            type="button"
            className="pp-button pp-button-primary pp-button-block"
            onClick={handleCreateRoom}
            disabled={isCreating}
            aria-busy={isCreating}
          >
            {isCreating ? "Creating room…" : "Create Room"}
          </button>
          <form className="pp-field-group" onSubmit={handleJoinRoom}>
            <label className="pp-label" htmlFor="home-room-id">
              Room ID
            </label>
            <input
              id="home-room-id"
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(event) => setJoinRoomId(event.target.value)}
              className="pp-field"
              autoComplete="off"
              aria-describedby="home-room-id-hint"
            />
            <p id="home-room-id-hint" className="pp-hint">
              Paste the ID shared by your moderator.
            </p>
            <button
              type="submit"
              disabled={isJoinDisabled}
              className="pp-button pp-button-secondary pp-button-block"
            >
              Join Room
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default HomeScreen;
