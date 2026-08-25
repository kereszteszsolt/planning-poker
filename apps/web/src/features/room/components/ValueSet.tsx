import {
  valueSets as votingValueSets,
  type ValueSet,
} from "@planning-poker/contracts";
import React from "react";

type ValueSetProps = {
  currentValueSet: ValueSet;
  changeValueSet: (newValueSet: ValueSet) => void;
  isModerator: boolean;
};

const ValueSetControl: React.FC<ValueSetProps> = ({
  currentValueSet,
  changeValueSet,
  isModerator,
}: ValueSetProps) => {
  return (
    <>
      <h2 className="pp-heading">Value Set: {currentValueSet}</h2>
      {isModerator && (
        <fieldset className="pp-radio-group">
          <legend className="sr-only">Choose the room value set</legend>
          {(Object.keys(votingValueSets) as ValueSet[]).map((set) => (
            <label key={set} className="pp-radio-option">
              <input
                type="radio"
                name="valueSet"
                value={set}
                checked={currentValueSet === set}
                disabled={!isModerator}
                onChange={() => changeValueSet(set)}
              />
              <span>{set}</span>
            </label>
          ))}
        </fieldset>
      )}
    </>
  );
};

export default ValueSetControl;
