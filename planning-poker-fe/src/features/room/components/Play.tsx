import React, { useMemo } from "react";
import type { Room, Participant } from "../../../shared/types";
import { votingValueSets } from "../../../shared/constants/voting-value-sets.ts";

type JoinProps = {
  room: Room;
  currentUser: Participant;
  kickOut: (participantId: string) => void;
  delegate: (participantId: string) => void;
  vote: (value: string | number) => void;
  revoke: () => void;
  reveal: () => void;
  reset: () => void;
  changeValueSet: (valueSet: string) => void;
};

const Play: React.FC<JoinProps> = ({
  room,
  currentUser,
  kickOut,
  delegate,
  vote,
  revoke,
  reveal,
  reset,
  changeValueSet,
}) => {
  const [selectedVote, setSelectedVote] = React.useState<
    string | number | null
  >(null);

  const handleVote = (value: string | number) => {
    setSelectedVote(value);
    vote(value);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    alert("Room ID copied to clipboard!");
  };

  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");
  };

  const nrOfVotedParticipants = useMemo(() => {
    return Object.values(room.participants).filter((p) => p.voted).length;
  }, [room.participants]);

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
      <h2 className="text-xl font-bold mb-4 text-gray-800">Participants</h2>
      <ul className="mb-6 space-y-2">
        {Object.values(room.participants).map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center p-3 border-b border-gray-200"
          >
            <div>
              {p.name}{" "}
              {p.isModerator && (
                <span className="text-sm text-gray-500">(Moderator)</span>
              )}{" "}
              {p.voted && <span className="text-sm text-green-500">✓</span>}{" "}
              {p.id === currentUser.id && (
                <span className="text-sm text-blue-500">(You)</span>
              )}
            </div>
            {currentUser.isModerator && !p.isModerator && (
              <div className="flex space-x-2">
                <button
                  onClick={() => kickOut(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Kick Out
                </button>
                <button
                  onClick={() => delegate(p.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Delegate
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

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

      {/* Voting Cards */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Vote</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {votingValueSets[room.valueSet].map((value) => (
          <button
            key={value}
            onClick={() => handleVote(value)}
            disabled={currentUser.voted}
            className={`px-4 py-6 rounded-lg font-bold transition-colors ${
              selectedVote === value
                ? "bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${currentUser.voted ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-row gap-4">
        {/* Moderator Actions */}
        {currentUser.isModerator && nrOfVotedParticipants > 0 && (
          <button
            onClick={reveal}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Reveal Votes
          </button>
        )}

        {currentUser.isModerator && nrOfVotedParticipants > 0 && (
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Reset Votes
          </button>
        )}

        {/* Revoke Vote Button */}
        {room.participants[currentUser.id] &&
          room.participants[currentUser.id].voted && (
            <button
              onClick={revoke}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Revoke Vote
            </button>
          )}
      </div>
    </div>
  );
};

export default Play;
