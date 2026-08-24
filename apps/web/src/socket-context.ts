import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@planning-poker/contracts";
import type { ConnectionStatus } from "./shared/connection-status";

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
