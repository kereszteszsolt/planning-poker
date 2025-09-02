import React from "react";
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
  const handleKickOut = (participantId: string) => {
    kickOut(participantId);
  };
  const handleDelegate = (participantId: string) => {
    delegate(participantId);
  };
  const handleRevoke = () => {
    revoke();
  };
  const handleReveal = () => {
    reveal();
  };
  const handleReset = () => {
    reset();
  };
  const handleChangeValueSet = (valueSet: string) => {
    changeValueSet(valueSet);
  };
  const handleVote = (value: string | number) => {
    console.log("Voting for:", value);
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

  return (
    <div className="p-6 bg-white rounded shadow">
      {/*RommId  copy roomID & copy link buttons*/}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Room ID: {room.id}
      </h1>
      <div className="mb-6 text-center">
        <button
          onClick={handleCopyRoomId}
          className="mr-2 p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Copy Room ID
        </button>
        <button
          onClick={handleCopyRoomLink}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Copy Room Link
        </button>
      </div>
      {/*card valuset radio buttons*/}
      <h2 className="text-xl font-bold mb-4">Value Set: {room.valueSet}</h2>
      <div className="mb-6">
        {Object.keys(votingValueSets).map((set) => (
          <label key={set} className="mr-4">
            <input
              type="radio"
              name="valueSet"
              value={set}
              checked={room.valueSet === set}
              disabled={!currentUser.isModerator}
              className="mr-1"
              onChange={() => handleChangeValueSet(set)} // Call the handler
            />
            {set}
          </label>
        ))}
      </div>
      {/*Participants List*/}
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="mb-2">
        {currentUser &&
          room.participants &&
          Object.values(room.participants).map((p) => (
            <li
              key={p.id}
              className="flex flex-row items-center justify-between border-b py-2"
            >
              {p.name} {p.isModerator && "(Moderator)"} {p.voted && "✓"}{" "}
              {p.id === currentUser.id && "(You)"}
              {currentUser.isModerator && !p.isModerator && (
                <div className="flex flex-row items-center gap-2">
                  <button
                    onClick={() => handleKickOut(p.id)}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Kick Out
                  </button>
                  <button
                    onClick={() => handleDelegate(p.id)}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Delegate
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>

      {/*votes*/}
      <h2 className={"text-xl font-bold mb-4"}>Votes</h2>
      <ul className="mb-6">
        {room.revealed
          ? Object.values(room.participants).map((p) => (
              <li key={p.id} className="border-b py-2">
                {p.name}: {p.vote !== null ? p.vote : "No Vote"}
              </li>
            ))
          : "Votes are hidden until revealed."}
      </ul>

      {/*Voting Cards */}
      <h2 className="text-xl font-bold mb-4">Vote</h2>
      <div className="flex flex-row gap-2">
        {votingValueSets[room.valueSet].map((value) => (
          <button
            key={value}
            onClick={() => handleVote(value)}
            className="p-2 bg-blue-500 text-white font-bold rounded w-10 h-14 flex items-center justify-center"
            disabled={currentUser.voted}
          >
            {value}
          </button>
        ))}
      </div>

      {/*Reveal and Reset Buttons - Reveal/Hide, Reset buttons for admin,  Revoke vote for individual use*/}
      {currentUser.isModerator && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleReveal}
            className="p-2 bg-green-500 text-white rounded"
          >
            Reveal Votes
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-yellow-500 text-white rounded"
          >
            Reset Votes
          </button>
        </div>
      )}
      {currentUser.voted && !currentUser.isModerator && (
        <div className="mt-4">
          <button
            onClick={handleRevoke}
            className="p-2 bg-red-500 text-white rounded"
          >
            Revoke Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default Play;
