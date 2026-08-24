import React from "react";

type VoteControlsProps = {
  onReveal?: () => void;
  onReset?: () => void;
  onRevoke?: () => void;
  canReveal?: boolean;
  canReset?: boolean;
  canRevoke?: boolean;
  isModerator?: boolean;
};

const VoteControls: React.FC<VoteControlsProps> = ({
  onReveal,
  onReset,
  onRevoke,
  canReveal,
  canReset,
  canRevoke,
  isModerator,
}) => (
  <div className="flex flex-row gap-4">
    {isModerator && (
      <button
        type="button"
        onClick={onReveal}
        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        disabled={!canReveal}
        aria-label="Reveal Votes"
      >
        Reveal Votes
      </button>
    )}
    {isModerator && (
      <button
        type="button"
        onClick={onReset}
        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        disabled={!canReset}
        aria-label="Reset Votes"
      >
        Reset Votes
      </button>
    )}
    {
      <button
        type="button"
        onClick={onRevoke}
        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        disabled={!canRevoke}
        aria-label="Revoke Vote"
      >
        Revoke Vote
      </button>
    }
  </div>
);

export default VoteControls;
