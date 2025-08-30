import React, { useContext, useEffect } from "react";
import { SocketContext } from "../SocketProvider.tsx";

const HomeScreen: React.FC = () => {
  const socket = useContext(SocketContext);

  useEffect(() => {}, [socket]);

  return (
    <div>
      <h1>Welcome to the Planning Poker App</h1>
      <p>
        This application is designed to facilitate agile planning sessions using
        the Planning Poker technique.
      </p>
      <p>Get started by creating or joining a room!</p>
    </div>
  );
};

export default HomeScreen;
