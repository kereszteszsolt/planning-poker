import React, { useState } from "react";

type JoinProps = {
  roomId: string;
  onJoin: (name: string) => void;
  error?: string;
};

const Join: React.FC<JoinProps> = ({ roomId, onJoin, error }) => {
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (!name.trim()) return;
    onJoin(name.trim());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Join Room: {roomId}</h2>
      <input
        type="text"
        placeholder="Enter your name"
        className="border p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleJoin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Join
      </button>
    </div>
  );
};

export default Join;
