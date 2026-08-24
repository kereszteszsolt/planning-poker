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
    <div className="w-full max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 break-all">Join Room: {roomId}</h2>
      <input
        type="text"
        placeholder="Enter your name"
        className="border p-2 w-full mb-4"
        value={name}
        minLength={2}
        maxLength={40}
        autoComplete="name"
        onChange={(e) => setName(e.target.value)}
      />
      {error && (
        <p className="text-red-700 mb-4" role="alert">
          {error}
        </p>
      )}
      <button
        onClick={handleJoin}
        className="bg-blue-500 text-white px-4 py-2 rounded self-start"
        disabled={name.trim().length < 2}
      >
        Join
      </button>
    </div>
  );
};

export default Join;
