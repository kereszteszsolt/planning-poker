import React from "react";
import type { Participant } from "../../../shared/types";

type StatisticsProps = {
  participants?: Record<string, Participant>;
  isRevealed: boolean;
};

const Statistics: React.FC<StatisticsProps> = ({
  participants,
  isRevealed,
}) => {
  if (!participants || Object.keys(participants).length === 0) {
    return null;
  }

  const votes = Object.values(participants).map((p) => p.vote);

  // Calculate frequency for all votes (numeric and non-numeric)
  const frequency = votes.reduce(
    (acc, vote) => {
      const key = vote === undefined ? "undefined" : vote.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Separate numeric votes for calculations
  const numericVotes = votes.filter((v): v is number => typeof v === "number");
  const hasNumericVotes = numericVotes.length > 0;

  // Special votes remain in the distribution and are excluded from numeric calculations.
  const average = hasNumericVotes
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(2)
    : null;
  const min = hasNumericVotes ? Math.min(...numericVotes) : null;
  const max = hasNumericVotes ? Math.max(...numericVotes) : null;
  const consensus =
    hasNumericVotes && numericVotes.every((v) => v === numericVotes[0])
      ? numericVotes[0]
      : null;

  // Sort keys for display (numbers first, then strings)
  const sortedKeys = Object.keys(frequency).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b);
  });

  return (
    <>
      {isRevealed && (
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Statistics</h2>
          <div className="space-y-4">
            {hasNumericVotes && (
              <div className="flex flex-wrap gap-4 items-center p-2 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Average: <span className="font-semibold">{average}</span>
                </p>
                {consensus !== null ? (
                  <p className="text-green-600 font-semibold">
                    Consensus: {consensus}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600">
                      Min: <span className="font-semibold">{min}</span>
                    </p>
                    <p className="text-gray-600">
                      Max: <span className="font-semibold">{max}</span>
                    </p>
                  </>
                )}
              </div>
            )}
            {hasNumericVotes && numericVotes.length < votes.length && (
              <p className="text-sm text-gray-600">
                Special cards are shown in the distribution and excluded from
                numeric statistics.
              </p>
            )}

            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Vote Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {sortedKeys.map((key) => (
                  <div
                    key={key}
                    className="flex justify-between p-2 bg-gray-100 rounded-lg"
                  >
                    <span className="font-medium">
                      {isNaN(parseFloat(key))
                        ? key === "undefined"
                          ? "Not Voted"
                          : key
                        : parseFloat(key)}
                    </span>
                    <span className="text-gray-600">
                      {frequency[key]} vote(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Statistics;
