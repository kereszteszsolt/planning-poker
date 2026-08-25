import React, { useState } from "react";

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
}) => {
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);

  const resetVotes = () => {
    onReset?.();
    setIsResetConfirmationOpen(false);
  };

  return (
    <div className="pp-stack">
      <div className="pp-control-row">
        {isModerator && (
          <button
            type="button"
            onClick={onReveal}
            className="pp-button pp-button-success"
            disabled={!canReveal}
          >
            Reveal Votes
          </button>
        )}
        {isModerator && (
          <button
            type="button"
            onClick={() => setIsResetConfirmationOpen(true)}
            className="pp-button pp-button-warning"
            disabled={!canReset}
          >
            Reset Votes
          </button>
        )}
        <button
          type="button"
          onClick={onRevoke}
          className="pp-button pp-button-danger"
          disabled={!canRevoke}
        >
          Revoke Vote
        </button>
      </div>
      {isResetConfirmationOpen && (
        <div
          className="pp-confirmation pp-stack"
          role="alertdialog"
          aria-label="Confirm vote reset"
        >
          <p className="pp-copy">Clear every submitted vote for this round?</p>
          <div className="pp-control-row">
            <button
              type="button"
              className="pp-button pp-button-secondary"
              onClick={() => setIsResetConfirmationOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pp-button pp-button-warning"
              onClick={resetVotes}
            >
              Confirm reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteControls;
