import type { Participant } from "./participant.model";
import type { ValueSet } from "./value-set.model";

export type Room = {
  id: string;
  valueSet: ValueSet;
  participants: Record<string, Participant>;
  revealed: boolean;
  lastUpdated?: number;
};
