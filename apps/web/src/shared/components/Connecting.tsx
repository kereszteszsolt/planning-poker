import React from "react";
import type { ConnectionStatus } from "../connection-status";

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
    <main className="pp-page pp-page-centered">
      <section
        className="pp-panel pp-form-panel text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <h1 className="pp-title">{copy.title}</h1>
        <p className="pp-copy">{copy.description}</p>
        {onRetry && status !== "initial" && status !== "reconnecting" && (
          <button
            type="button"
            className="pp-button pp-button-primary mt-4"
            onClick={onRetry}
          >
            Retry connection
          </button>
        )}
      </section>
    </main>
  );
};

export default Connecting;
