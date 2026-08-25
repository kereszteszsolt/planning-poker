import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@planning-poker/contracts";
import type { Socket } from "socket.io-client";

export type ApplicationSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
