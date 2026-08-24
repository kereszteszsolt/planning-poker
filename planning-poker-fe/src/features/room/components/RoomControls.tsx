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
    <div className="p-6 bg-white rounded-lg shadow w-full min-w-0">
      <h1 className="text-[16px] font-bold mb-4 text-center text-gray-800 break-all">
        Room: <span className="text-blue-600">{roomId}</span>
      </h1>
      <div className="flex flex-col sm:flex-row w-full gap-3">
        <button
          type="button"
          onClick={() => copy(roomId, "copied-id")}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 w-full"
        >
          Copy Room ID
        </button>
        <button
          type="button"
          onClick={() => copy(roomLink, "copied-link")}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 w-full"
        >
          Copy Room Link
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 w-full"
        >
          Leave Room
        </button>
      </div>
      <p className="mt-3 text-sm text-center text-gray-600" aria-live="polite">
        {copyState === "copied-id" && "Room ID copied."}
        {copyState === "copied-link" && "Room link copied."}
        {copyState === "failed" &&
          "Clipboard access failed. Copy the room ID manually."}
      </p>
    </div>
  );
};

export default RoomControls;
