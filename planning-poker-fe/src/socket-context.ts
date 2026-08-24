import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ConnectionStatus,
  ServerToClientEvents,
} from "./shared/socket-contracts";

export type ApplicationSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
export type SocketContextValue = {
  socket: ApplicationSocket;
  status: ConnectionStatus;
  retry: () => void;
};

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);
