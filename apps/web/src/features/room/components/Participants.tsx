import React, { useRef, useState } from "react";
import type { Participant } from "@planning-poker/contracts";

type ParticipantProps = {
  participants: Record<string, Participant>;
  currentUserId: string;
  kickOut: (participantId: string) => void;
  delegate: (participantId: string) => void;
};
const Participants: React.FC<ParticipantProps> = ({
  participants,
  currentUserId,
  kickOut,
  delegate,
}: ParticipantProps) => {
  const currentUser = participants[currentUserId];
  const [participantToRemove, setParticipantToRemove] = useState<string>();
  const removalTrigger = useRef<HTMLButtonElement | null>(null);

  const cancelRemoval = () => {
    const trigger = removalTrigger.current;
    setParticipantToRemove(undefined);
    queueMicrotask(() => trigger?.focus());
  };

  const confirmRemoval = () => {
    if (!participantToRemove) return;
    kickOut(participantToRemove);
    setParticipantToRemove(undefined);
  };

  return (
    <section className="pp-panel" aria-labelledby="participants-heading">
      <h2 id="participants-heading" className="pp-heading">
        Participants
      </h2>
      <ul className="pp-participant-list">
        {Object.values(participants).map((p) => (
          <li key={p.id} className="pp-participant">
            <div className="pp-participant-name" title={p.name}>
              {p.name}
              {p.isModerator && <span className="pp-badge">Moderator</span>}
              {p.voted && (
                <span className="pp-badge pp-badge-success">
                  Vote submitted
                </span>
              )}
              {p.id === currentUserId && <span className="pp-badge">You</span>}
            </div>
            {currentUser?.isModerator && !p.isModerator && (
              <div className="pp-control-row">
                <button
                  type="button"
                  ref={
                    participantToRemove === p.id ? removalTrigger : undefined
                  }
                  onClick={(event) => {
                    removalTrigger.current = event.currentTarget;
                    setParticipantToRemove(p.id);
                  }}
                  className="pp-button pp-button-danger"
                  aria-label={`Remove ${p.name} from the room`}
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => delegate(p.id)}
                  className="pp-button pp-button-secondary"
                  aria-label={`Make ${p.name} the moderator`}
                >
                  Make moderator
                </button>
              </div>
            )}
            {participantToRemove === p.id && (
              <div
                className="pp-confirmation pp-stack"
                role="alertdialog"
                aria-label={`Confirm removal of ${p.name}`}
              >
                <p className="pp-copy">
                  Remove <strong>{p.name}</strong> from this room?
                </p>
                <div className="pp-control-row">
                  <button
                    type="button"
                    className="pp-button pp-button-secondary"
                    onClick={cancelRemoval}
                    autoFocus
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="pp-button pp-button-danger"
                    onClick={confirmRemoval}
                  >
                    Confirm removal
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Participants;
