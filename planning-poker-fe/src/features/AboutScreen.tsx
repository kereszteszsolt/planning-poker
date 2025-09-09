import React from "react";

const AboutScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          About Planning Poker
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            What is Planning Poker?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Planning Poker is a consensus-based, gamified technique for
            estimating the effort or relative size of tasks in software
            development. It helps teams make more accurate and collaborative
            estimates by discussing and voting on story points.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            How to Use This App
          </h2>
          <p className="text-gray-600 leading-relaxed">
            1. **Create or Join a Room**: Enter a room ID or create a new one.
          </p>
          <p className="text-gray-600 leading-relaxed">
            2. **Invite Participants**: Share the room link with your team.
          </p>
          <p className="text-gray-600 leading-relaxed">
            3. **Vote**: Select a card representing your estimate and reveal
            your vote.
          </p>
          <p className="text-gray-600 leading-relaxed">
            4. **Discuss and Repeat**: Discuss estimates and vote again if
            needed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Data Responsibility and Privacy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This app is provided for your convenience and is intended for
            immediate, collaborative use.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium">
            <strong>No Data Storage:</strong> Your data is not stored
            permanently. Rooms are accessible to anyone with the link, but all
            data is immediately deleted as soon as the last participant leaves
            the room.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium">
            <strong>No Encryption:</strong> Data transmitted during your session
            is not encrypted. Do not use this app for sensitive or confidential
            information.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium">
            <strong>Use at Your Own Risk:</strong> You are solely responsible
            for how you use this app. The developers are not liable for any
            misuse or data exposure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Open Source
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This Planning Poker app is open-source. You can contribute, report
            issues, or deploy your own instance.
          </p>
        </section>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Keresztes Zsolt
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
