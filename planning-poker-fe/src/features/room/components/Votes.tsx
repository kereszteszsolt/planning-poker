import React from "react";
import type { Participant } from "../../../shared/types";

type VotesProps = {
  participants: Record<string, Participant>;
  isRevealed: boolean;
};

const Votes: React.FC<VotesProps> = ({ participants, isRevealed }) => {
  const votedParticipants = Object.entries(participants).filter(
    ([_, participant]) => participant.voted,
  );
  const notVotedParticipants = Object.entries(participants).filter(
    ([_, participant]) => !participant.voted,
  );

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Votes</h2>

      {/* Main row for participants who have voted */}
      <div className="flex flex-wrap gap-4 mb-4">
        {votedParticipants.map(([id, participant]) => (
          <div key={id} className="flex flex-col items-center">
            <div
              className={`w-14 h-18 flex items-center justify-center rounded-lg font-bold text-white ${
                isRevealed
                  ? participant.vote !== undefined && participant.vote !== null
                    ? "bg-blue-500"
                    : "bg-gray-300"
                  : "bg-gray-500"
              }`}
            >
              {isRevealed ? (participant.vote ?? "-") : "?"}
            </div>
            <span className="text-sm text-gray-700 mt-1 truncate w-16 text-center">
              {participant.name}
            </span>
          </div>
        ))}
      </div>

      {/* Section for participants who haven't voted yet */}
      {notVotedParticipants.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Not Voted</h3>
          <div className="flex flex-wrap gap-2">
            {notVotedParticipants.map(([id, participant]) => (
              <div
                key={id}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs text-gray-700 font-bold"
              >
                {participant.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Votes;
