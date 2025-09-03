import React, { JSX } from "react";
import type { Room, Participant } from "../../../shared/types";
import { votingValueSets } from "../../../shared/constants/voting-value-sets.ts";

type JoinProps = {
  children?: JSX.Element;
  room: Room;
  currentUser: Participant;
  changeValueSet: (valueSet: string) => void;
};

const Play: React.FC<JoinProps> = ({
  children,
  room,
  currentUser,
  changeValueSet,
}) => {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    alert("Room ID copied to clipboard!");
  };

  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Room ID and Copy Buttons */}
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Room ID: {room.id}
      </h1>
      <div className="mb-6 text-center space-x-2">
        <button
          onClick={handleCopyRoomId}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Copy Room ID
        </button>
        <button
          onClick={handleCopyRoomLink}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Copy Room Link
        </button>
      </div>

      {/* Value Set Selection */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Value Set: {room.valueSet}
      </h2>
      <div className="mb-6 flex flex-wrap gap-4">
        {Object.keys(votingValueSets).map((set) => (
          <label key={set} className="flex items-center space-x-2">
            <input
              type="radio"
              name="valueSet"
              value={set}
              checked={room.valueSet === set}
              disabled={!currentUser.isModerator}
              onChange={() => changeValueSet(set)}
              className="h-4 w-4 text-blue-500"
            />
            <span className="text-gray-700">{set}</span>
          </label>
        ))}
      </div>

      {/* Participants List */}

      {/* Votes Section */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Votes</h2>
      <ul className="mb-6 space-y-2">
        {room.revealed
          ? Object.values(room.participants).map((p) => (
              <li key={p.id} className="p-3 border-b border-gray-200">
                {p.name}: {p.vote !== null ? p.vote : "No Vote"}
              </li>
            ))
          : "Votes are hidden until revealed."}
      </ul>
      {children}
    </div>
  );
};

export default Play;
