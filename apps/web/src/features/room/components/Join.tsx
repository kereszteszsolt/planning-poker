import React, { useState } from "react";

type JoinProps = {
  roomId: string;
  onJoin: (name: string) => void;
  error?: string;
};

const Join: React.FC<JoinProps> = ({ roomId, onJoin, error }) => {
  const [name, setName] = useState("");

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim());
  };

  const errorId = error ? "join-name-error" : undefined;

  return (
    <main className="pp-page pp-page-centered">
      <section className="pp-panel pp-form-panel" aria-labelledby="join-title">
        <h1 id="join-title" className="pp-title">
          Join Room
        </h1>
        <p className="pp-copy">
          Room: <span className="pp-room-id">{roomId}</span>
        </p>
        <form className="pp-stack mt-6" onSubmit={handleJoin}>
          <div className="pp-field-group">
            <label className="pp-label" htmlFor="participant-name">
              Your name
            </label>
            <input
              id="participant-name"
              type="text"
              placeholder="Enter your name"
              className="pp-field"
              value={name}
              minLength={2}
              maxLength={40}
              autoComplete="name"
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={errorId}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {error && (
            <p id={errorId} className="pp-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="pp-button pp-button-primary"
            disabled={name.trim().length < 2}
          >
            Join Room
          </button>
        </form>
      </section>
    </main>
  );
};

export default Join;
