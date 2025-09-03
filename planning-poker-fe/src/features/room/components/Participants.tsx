import React from "react";
import type { Participant } from "../../../shared/types";

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
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Participants</h2>
      <ul className="mb-6 space-y-2">
        {Object.values(participants).map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center p-3 border-b border-gray-200"
          >
            <div>
              {p.name}{" "}
              {p.isModerator && (
                <span className="text-sm text-gray-500">(Moderator)</span>
              )}{" "}
              {p.voted && <span className="text-sm text-green-500">✓</span>}{" "}
              {p.id === currentUserId && (
                <span className="text-sm text-blue-500">(You)</span>
              )}
            </div>
            {participants[currentUserId] && !p.isModerator && (
              <div className="flex space-x-2">
                <button
                  onClick={() => kickOut(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Kick Out
                </button>
                <button
                  onClick={() => delegate(p.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Delegate
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Participants;
