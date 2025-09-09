import React from "react";

const Connecting: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Connecting...</h1>
      <p className="mb-2 text-gray-700 text-center">
        Attempting to establish a connection. Please wait a moment. The server
        may be down.
      </p>
    </div>
  );
};

export default Connecting;
