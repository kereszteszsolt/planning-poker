import React from "react";

type Participant = {
  id: string;
  name: string;
  voted: boolean;
  vote?: number | string;
  isModerator: boolean;
};

type ValueSet = any; // Placeholder, define properly elsewhere

type Room = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated?: number;
};

type JoinProps = {
  room: Room;
  currentUser: Participant;
  kickOut: (participantId: string) => void;
};

const Play: React.FC<JoinProps> = ({ room, currentUser, kickOut }) => {
  const handleKickOut = (participantId: string) => {
    kickOut(participantId);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <ul className="mb-2">
        {currentUser && room.participants ? (
          Object.values(room.participants).map((p) => (
            <li key={p.id}>
              {p.name} {p.isModerator && "(Moderator)"} {p.voted && "✓"}{" "}
              {p.id === currentUser.id && "(You)"}
              {currentUser.isModerator && !p.isModerator && (
                <button
                  onClick={() => handleKickOut(p.id)}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  Kick Out
                </button>
              )}
            </li>
          ))
        ) : (
          <li>No participants</li>
        )}
      </ul>
    </div>
  );
};

export default Play;
