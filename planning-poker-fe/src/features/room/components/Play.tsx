import React from "react";
import type { Room, Participant } from "../../../shared/types";
import { votingValueSets } from "../../../shared/constants/voting-value-sets.ts";

type JoinProps = {
  room: Room;
  currentUser: Participant;
  kickOut: (participantId: string) => void;
};

const Play: React.FC<JoinProps> = ({ room, currentUser, kickOut }) => {
  const handleKickOut = (participantId: string) => {
    kickOut(participantId);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      {/*Participants List*/}
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="mb-2">
        {currentUser &&
          room.participants &&
          Object.values(room.participants).map((p) => (
            <li key={p.id}>
              {p.name} {p.isModerator && "(Moderator)"} {p.voted && "✓"}{" "}
              {p.id === currentUser.id && "(You)"}
              {currentUser.isModerator && !p.isModerator && (
                <button
                  onClick={() => handleKickOut(p.id)}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  Kick Out
                </button>
              )}
            </li>
          ))}
      </ul>

      {/*Voting Cards */}
      <h2 className="text-xl font-bold mb-4">Vote</h2>
      <div className="flex flex-row gap-2">
        {votingValueSets[room.valueSet].map((value) => (
          <button
            key={value}
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
            // onClick={handleReveal}
            className="p-2 bg-green-500 text-white rounded"
          >
            Reveal Votes
          </button>
          <button
            // onClick={handleReset}
            className="p-2 bg-yellow-500 text-white rounded"
          >
            Reset Votes
          </button>
        </div>
      )}
      {currentUser.voted && !currentUser.isModerator && (
        <div className="mt-4">
          <button
            // onClick={handleRevokeVote}
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
