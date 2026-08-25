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
    <div>
      <p className="pp-hint mb-3" aria-live="polite">
        {disabled
          ? "Voting is closed while results are revealed."
          : "Choose one card to submit your estimate."}
      </p>
      <div className="pp-vote-grid" aria-label="Voting cards">
        {valueSet.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onVote(value)}
            disabled={disabled}
            className="pp-vote-card"
            aria-pressed={selectedVote === value}
            aria-label={`${value}${selectedVote === value ? ", selected" : ""}`}
          >
            {value}
            {selectedVote === value && (
              <span className="pp-vote-card-state">Selected ✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingCards;
