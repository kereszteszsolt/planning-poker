import React, { createContext } from "react";
import type { ReactNode } from "react";
import io from "socket.io-client";

export const SocketContext = createContext<SocketIOClient.Socket | undefined>(
  undefined,
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = io("http://localhost:3000");

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
