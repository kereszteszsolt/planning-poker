import React from "react";
import type { Participant } from "@planning-poker/contracts";

type VotesProps = {
  participants: Record<string, Participant>;
  isRevealed: boolean;
};

const Votes: React.FC<VotesProps> = ({ participants, isRevealed }) => {
  const votedParticipants = Object.entries(participants).filter(
    ([, participant]) => participant.voted,
  );
  const notVotedParticipants = Object.entries(participants).filter(
    ([, participant]) => !participant.voted,
  );

  return (
    <section aria-labelledby="votes-heading">
      <h2 id="votes-heading" className="pp-heading">
        Votes
      </h2>

      <div className="pp-votes mb-4">
        {votedParticipants.map(([id, participant]) => (
          <div key={id} className="pp-vote-result">
            <div
              className={`pp-vote-result-card ${
                isRevealed &&
                participant.vote !== undefined &&
                participant.vote !== null
                  ? "pp-vote-result-card-revealed"
                  : ""
              }`}
              aria-label={
                isRevealed
                  ? `${participant.name} voted ${participant.vote ?? "no value"}`
                  : `${participant.name} submitted a vote`
              }
            >
              {isRevealed ? (participant.vote ?? "-") : "?"}
            </div>
            <span className="pp-name-caption" title={participant.name}>
              {participant.name}
            </span>
          </div>
        ))}
      </div>

      {notVotedParticipants.length > 0 && (
        <div className="mt-4">
          <h3 className="pp-label mb-2">Waiting for a vote</h3>
          <div className="pp-control-row">
            {notVotedParticipants.map(([id, participant]) => (
              <div key={id} className="pp-chip" title={participant.name}>
                {participant.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Votes;
