import React, { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SocketContext } from "./socket-context";
import {
  createApplicationSocket,
  getApplicationSocket,
  type SocketFactory,
} from "./socket-client";
import type { ConnectionStatus } from "./shared/socket-contracts";

type SocketProviderProps = {
  children: ReactNode;
  socketFactory?: SocketFactory;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  socketFactory = createApplicationSocket,
}) => {
  const [socket] = useState(() => getApplicationSocket(socketFactory));
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? "connected" : "initial",
  );
  const connectedOnce = useRef(socket.connected);

  useEffect(() => {
    const handleConnect = () => {
      connectedOnce.current = true;
      setStatus("connected");
    };
    const handleDisconnect = (reason: string) => {
      setStatus(
        reason === "io server disconnect" ? "session-lost" : "reconnecting",
      );
    };
    const handleConnectError = () => {
      setStatus(
        connectedOnce.current ? "recoverable-error" : "server-unavailable",
      );
    };
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleReconnectError = () => setStatus("recoverable-error");
    const handleReconnectFailed = () => setStatus("server-unavailable");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect_error", handleReconnectError);
    socket.io.on("reconnect_failed", handleReconnectFailed);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect_error", handleReconnectError);
      socket.io.off("reconnect_failed", handleReconnectFailed);
      socket.disconnect();
    };
  }, [socket]);

  const retry = () => {
    setStatus("reconnecting");
    socket.connect();
  };

  return (
    <SocketContext.Provider value={{ socket, status, retry }}>
      {children}
    </SocketContext.Provider>
  );
};
