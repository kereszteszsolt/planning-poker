import React, { useState } from "react";

type RoomControlsProps = { roomId: string; onLeave: () => void };
type CopyState = "idle" | "copied-id" | "copied-link" | "failed";

const RoomControls: React.FC<RoomControlsProps> = ({ roomId, onLeave }) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const copy = async (value: string, successState: CopyState) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(successState);
    } catch {
      setCopyState("failed");
    }
  };

  const basePath = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const roomLink = new URL(
    `${basePath}room/${roomId}`,
    window.location.origin,
  ).toString();

  return (
    <section className="pp-panel" aria-labelledby="room-controls-heading">
      <h2 id="room-controls-heading" className="pp-heading">
        Room
      </h2>
      <p className="pp-copy pp-room-id" title={roomId}>
        {roomId}
      </p>
      <div className="pp-control-row mt-4">
        <button
          type="button"
          onClick={() => copy(roomId, "copied-id")}
          className="pp-button pp-button-secondary"
        >
          Copy Room ID
        </button>
        <button
          type="button"
          onClick={() => copy(roomLink, "copied-link")}
          className="pp-button pp-button-secondary"
        >
          Copy Room Link
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="pp-button pp-button-danger"
        >
          Leave Room
        </button>
      </div>
      <p className="pp-status mt-3" aria-live="polite" aria-atomic="true">
        {copyState === "copied-id" && "Room ID copied."}
        {copyState === "copied-link" && "Room link copied."}
        {copyState === "failed" &&
          "Clipboard access failed. Copy the room ID manually."}
      </p>
    </section>
  );
};

export default RoomControls;
