import { votingValueSets } from "../../../shared/constants/voting-value-sets.ts";
import React from "react";

type ValueSetProps = {
  currentValueSet: string;
  changeValueSet: (newValueSet: string) => void;
  isModerator: boolean;
};

const ValueSet: React.FC<ValueSetProps> = ({
  currentValueSet,
  changeValueSet,
  isModerator,
}: ValueSetProps) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Value Set: {currentValueSet}
      </h2>
      <div className="mb-6 flex flex-wrap gap-4">
        {Object.keys(votingValueSets).map((set) => (
          <label key={set} className="flex items-center space-x-2">
            <input
              type="radio"
              name="valueSet"
              value={set}
              checked={currentValueSet === set}
              disabled={!isModerator}
              onChange={() => changeValueSet(set)}
              className="h-4 w-4 text-blue-500"
            />
            <span className="text-gray-700">{set}</span>
          </label>
        ))}
      </div>
    </>
  );
};

export default ValueSet;
