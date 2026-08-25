import { useState, type ReactNode } from "react";
import {
  createPlanningPokerStore,
  type PlanningPokerStore,
} from "./planning-poker-store";
import { PlanningPokerStoreContext } from "./planning-poker-store-context";

type PlanningPokerStoreProviderProps = {
  children: ReactNode;
  store?: PlanningPokerStore;
};

export const PlanningPokerStoreProvider = ({
  children,
  store: injectedStore,
}: PlanningPokerStoreProviderProps) => {
  const [store] = useState(() => injectedStore ?? createPlanningPokerStore());
  return (
    <PlanningPokerStoreContext.Provider value={store}>
      {children}
    </PlanningPokerStoreContext.Provider>
  );
};
