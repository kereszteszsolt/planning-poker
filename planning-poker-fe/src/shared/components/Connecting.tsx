import React from "react";
import type { ConnectionStatus } from "../socket-contracts";

const statusCopy: Record<
  ConnectionStatus,
  { title: string; description: string }
> = {
  initial: {
    title: "Connecting…",
    description: "Establishing the initial server connection.",
  },
  connected: {
    title: "Connected",
    description: "The server connection is ready.",
  },
  reconnecting: {
    title: "Reconnecting…",
    description:
      "The connection was interrupted. Your room session will be resumed when possible.",
  },
  "recoverable-error": {
    title: "Connection interrupted",
    description:
      "A temporary connection attempt failed. You can retry without losing the saved room session.",
  },
  "session-lost": {
    title: "Session connection lost",
    description:
      "The server ended this connection. Retry to recover the room or rejoin with your name.",
  },
  "server-unavailable": {
    title: "Server unavailable",
    description:
      "The Planning Poker server could not be reached. Check the server and try again.",
  },
};

type ConnectingProps = { status: ConnectionStatus; onRetry?: () => void };

const Connecting: React.FC<ConnectingProps> = ({ status, onRetry }) => {
  const copy = statusCopy[status];
  return (
    <div
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow"
      role="status"
    >
      <h1 className="text-2xl font-bold mb-4 text-center">{copy.title}</h1>
      <p className="mb-2 text-gray-700 text-center">{copy.description}</p>
      {onRetry && status !== "initial" && status !== "reconnecting" && (
        <button
          type="button"
          className="block mx-auto mt-4 p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          onClick={onRetry}
        >
          Retry connection
        </button>
      )}
    </div>
  );
};

export default Connecting;
