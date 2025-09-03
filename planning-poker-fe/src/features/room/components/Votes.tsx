import React from "react";

type VotesProps = {
  votes: Record<string, string | number | null>;
  isRevealed: boolean;
};

const Votes: React.FC<VotesProps> = ({ votes, isRevealed }) => {
  return (
    // <div className="p-4 bg-white rounded-lg shadow-sm">
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Votes</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(votes).map(([name, vote]) => (
          <div key={name} className="flex flex-col items-center">
            <div
              className={`w-14 h-18 flex items-center justify-center rounded-lg font-bold text-white ${
                isRevealed
                  ? vote
                    ? "bg-blue-500"
                    : "bg-gray-300"
                  : "bg-gray-400"
              }`}
            >
              {isRevealed ? (vote ?? "?") : "?"}
            </div>

            <span className="text-sm text-gray-700 mt-1 truncate w-16 text-center">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Votes;
