export type ConnectionStatus =
  | "initial"
  | "connected"
  | "reconnecting"
  | "recoverable-error"
  | "session-lost"
  | "server-unavailable";
