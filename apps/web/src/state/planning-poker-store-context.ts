import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type {
  PlanningPokerState,
  PlanningPokerStore,
} from "./planning-poker-store";

export const PlanningPokerStoreContext =
  createContext<PlanningPokerStore | null>(null);

export const usePlanningPokerStoreApi = () => {
  const store = useContext(PlanningPokerStoreContext);
  if (!store) {
    throw new Error(
      "Planning Poker state must be used inside PlanningPokerStoreProvider.",
    );
  }
  return store;
};

export const usePlanningPokerSelector = <Selected>(
  selector: (state: PlanningPokerState) => Selected,
) => useStore(usePlanningPokerStoreApi(), selector);
