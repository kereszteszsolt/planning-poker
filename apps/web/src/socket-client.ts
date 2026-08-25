import { io } from "socket.io-client";
import type { ApplicationSocket } from "./socket-types";

export type SocketFactory = () => ApplicationSocket;
let applicationSocket: ApplicationSocket | undefined;

export const createApplicationSocket = (): ApplicationSocket =>
  io(import.meta.env.VITE_SOCKET_URL?.trim() || undefined, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 5_000,
  });

export const getApplicationSocket = (
  socketFactory: SocketFactory = createApplicationSocket,
): ApplicationSocket => {
  applicationSocket ??= socketFactory();
  return applicationSocket;
};

export const resetApplicationSocketForTests = () => {
  applicationSocket?.disconnect();
  applicationSocket = undefined;
};
