import React from "react";

type VotingCardsProps = {
  onVote: (value: number | string) => void;
  valueSet: (number | string)[];
  selectedVote: number | string | undefined;
  disabled?: boolean;
};

const VotingCards: React.FC<VotingCardsProps> = ({
  onVote,
  valueSet,
  selectedVote,
  disabled,
}) => {
  return (
    <div className="flex flex-col">
      {/*<h2 className="text-xl font-bold mb-4 text-gray-800">Vote</h2>*/}
      <div className="flex flex-wrap gap-2 mb-6">
        {valueSet.map((value) => (
          <button
            key={value}
            onClick={() => onVote(value)}
            disabled={disabled}
            className={`px-4 py-6 rounded-lg font-bold transition-colors ${
              selectedVote === value
                ? "bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-900"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingCards;
