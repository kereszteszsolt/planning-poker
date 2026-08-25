import React, { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  createApplicationSocket,
  getApplicationSocket,
  type SocketFactory,
} from "./socket-client";
import {
  usePlanningPokerSelector,
  usePlanningPokerStoreApi,
} from "./state/planning-poker-store-context";
import { selectConnectionStatus } from "./state/planning-poker-store";
import { createPlanningPokerTransport } from "./transport/planning-poker-transport";
import { PlanningPokerTransportContext } from "./transport/transport-context";

type SocketProviderProps = {
  children: ReactNode;
  socketFactory?: SocketFactory;
};

const ConnectionStatusAnnouncer = () => {
  const status = usePlanningPokerSelector(selectConnectionStatus);
  const previousStatus = useRef(status);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (
      status === "connected" &&
      previousStatus.current !== "connected" &&
      previousStatus.current !== "initial"
    ) {
      setAnnouncement("Connection restored. Your room is synchronized.");
    }
    previousStatus.current = status;
  }, [status]);

  return (
    <span className="sr-only" role="status" aria-live="polite">
      {announcement}
    </span>
  );
};

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  socketFactory = createApplicationSocket,
}) => {
  const store = usePlanningPokerStoreApi();
  const [socket] = useState(() => getApplicationSocket(socketFactory));
  const [transport] = useState(() =>
    createPlanningPokerTransport({ socket, store }),
  );

  useEffect(() => transport.start(), [transport]);

  return (
    <PlanningPokerTransportContext.Provider value={transport}>
      <ConnectionStatusAnnouncer />
      {children}
    </PlanningPokerTransportContext.Provider>
  );
};
