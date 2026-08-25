import React from "react";
import type { Participant } from "@planning-poker/contracts";

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
        <section aria-labelledby="statistics-heading">
          <h2 id="statistics-heading" className="pp-heading">
            Statistics
          </h2>
          <div className="pp-stack">
            {hasNumericVotes && (
              <div className="pp-stat-summary">
                <p>
                  Average: <span className="font-semibold">{average}</span>
                </p>
                {consensus !== null ? (
                  <p className="font-semibold">Consensus: {consensus}</p>
                ) : (
                  <>
                    <p>
                      Min: <span className="font-semibold">{min}</span>
                    </p>
                    <p>
                      Max: <span className="font-semibold">{max}</span>
                    </p>
                  </>
                )}
              </div>
            )}
            {hasNumericVotes && numericVotes.length < votes.length && (
              <p className="pp-hint">
                Special cards are shown in the distribution and excluded from
                numeric statistics.
              </p>
            )}

            <div className="pp-stack">
              <h3 className="pp-label">Vote distribution</h3>
              <div className="pp-distribution-grid">
                {sortedKeys.map((key) => (
                  <div key={key} className="pp-distribution-item">
                    <span className="font-medium">
                      {isNaN(parseFloat(key))
                        ? key === "undefined"
                          ? "Not Voted"
                          : key
                        : parseFloat(key)}
                    </span>
                    <span>{frequency[key]} vote(s)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Statistics;
