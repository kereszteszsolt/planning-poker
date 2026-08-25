import { createContext, useContext } from "react";
import type { PlanningPokerTransport } from "./planning-poker-transport";

export const PlanningPokerTransportContext =
  createContext<PlanningPokerTransport | null>(null);

export const usePlanningPokerTransport = () => {
  const transport = useContext(PlanningPokerTransportContext);
  if (!transport) {
    throw new Error(
      "Planning Poker transport must be used inside SocketProvider.",
    );
  }
  return transport;
};
