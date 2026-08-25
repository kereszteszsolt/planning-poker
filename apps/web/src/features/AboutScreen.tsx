import React from "react";

const AboutScreen: React.FC = () => {
  return (
    <main className="pp-page pp-page-centered">
      <article className="pp-panel pp-about-panel pp-stack">
        <h1 className="pp-title text-center">About Planning Poker</h1>
        <p className="pp-copy text-center">Estimate. Discuss. Align.</p>

        <section>
          <h2 className="pp-heading">What is Planning Poker?</h2>
          <p className="pp-copy">
            Planning Poker is a consensus-based technique for estimating the
            relative size of work. Private voting helps a team compare
            perspectives before discussing an estimate.
          </p>
        </section>

        <section>
          <h2 className="pp-heading">How it works</h2>
          <ol className="pp-list">
            <li>Create a room and share its link with your team.</li>
            <li>Each participant chooses an estimate.</li>
            <li>The moderator reveals the votes for discussion.</li>
            <li>Reset and vote again when another round is useful.</li>
          </ol>
        </section>

        <section>
          <h2 className="pp-heading">Data Responsibility and Privacy</h2>
          <ul className="pp-list">
            <li>
              Rooms live in server memory and are removed after the last
              participant leaves; no account or room history is provided.
            </li>
            <li>
              A room link grants access to that room. Share it only with the
              intended participants and do not enter sensitive information.
            </li>
            <li>
              This browser keeps short-lived session details so it can attempt
              to reconnect to the current room.
            </li>
            <li>
              Traffic protection depends on deployment. Local HTTP is not
              encrypted; production deployments should use HTTPS and WSS.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="pp-heading">Open Source</h2>
          <p className="pp-copy">
            This Planning Poker app is open source. You can contribute, report
            issues, or deploy your own instance.
          </p>
        </section>

        <footer className="text-center mt-4">
          <p className="pp-hint">
            © {new Date().getFullYear()} Keresztes Zsolt
          </p>
        </footer>
      </article>
    </main>
  );
};

export default AboutScreen;
