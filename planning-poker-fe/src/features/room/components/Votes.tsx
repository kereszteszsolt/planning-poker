import React from "react";
import type { Participant } from "../../../shared/types";

type VotesProps = {
  participants: Record<string, Participant>;
  isRevealed: boolean;
};

const Votes: React.FC<VotesProps> = ({ participants, isRevealed }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Votes</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(participants).map(([id, participant]) => (
          <div key={id} className="flex flex-col items-center">
            <div
              className={`w-14 h-18 flex items-center justify-center rounded-lg font-bold text-white ${
                isRevealed
                  ? participant.vote !== undefined && participant.vote !== null
                    ? "bg-blue-500"
                    : "bg-gray-300"
                  : participant.voted
                    ? "bg-gray-500"
                    : "bg-gray-300"
              }`}
            >
              {isRevealed
                ? (participant.vote ?? "?")
                : participant.voted
                  ? "?"
                  : "-"}
            </div>
            <span className="text-sm text-gray-700 mt-1 truncate w-16 text-center">
              {participant.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Votes;
