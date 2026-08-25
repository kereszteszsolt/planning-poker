import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createApplicationSocket,
  getApplicationSocket,
  type SocketFactory,
} from "./socket-client";
import { usePlanningPokerStoreApi } from "./state/planning-poker-store-context";
import { createPlanningPokerTransport } from "./transport/planning-poker-transport";
import { PlanningPokerTransportContext } from "./transport/transport-context";

type SocketProviderProps = {
  children: ReactNode;
  socketFactory?: SocketFactory;
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
      {children}
    </PlanningPokerTransportContext.Provider>
  );
};
