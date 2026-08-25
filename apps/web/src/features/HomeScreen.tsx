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

  useEffect(() => transport.returnHome(), [transport]);

  const handleCreateRoom = async () => {
    const roomId = await transport.createRoom();
    if (roomId) navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`);
    }
  };

  const isJoinDisabled = !joinRoomId.trim();

  if (status !== "connected") {
    return <Connecting status={status} onRetry={transport.retryConnection} />;
  }
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Welcome to the Planning Poker App
      </h1>
      <p className="mb-2 text-gray-700 text-center">
        This application is designed to facilitate agile planning sessions using
        the Planning Poker technique.
      </p>
      <p className="mb-6 text-gray-600 text-center">
        Get started by creating or joining a room!
      </p>
      {error && (
        <p className="mb-4 text-red-700 text-center" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-row gap-4">
        <button
          className="w-1/2 p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>
        <div className="flex flex-col w-1/2">
          <input
            type="text"
            placeholder="Enter Room UUID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            disabled={isJoinDisabled}
            className={`w-full p-2 rounded font-semibold transition ${
              isJoinDisabled
                ? "bg-blue-200 text-blue-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
