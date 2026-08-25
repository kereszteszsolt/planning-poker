import { memo } from "react";
import { valueSets as votingValueSets } from "@planning-poker/contracts";
import { usePlanningPokerSelector } from "../../state/planning-poker-store-context";
import {
  selectActiveRoomId,
  selectCanReset,
  selectCanReveal,
  selectCanRevoke,
  selectCurrentParticipantId,
  selectCurrentVote,
  selectIsModerator,
  selectParticipants,
  selectRoomRevealed,
  selectRoomValueSet,
} from "../../state/planning-poker-store";
import { usePlanningPokerTransport } from "../../transport/transport-context";
import Participants from "./components/Participants";
import RoomControls from "./components/RoomControls";
import Statistics from "./components/Statistics";
import ValueSetControl from "./components/ValueSet";
import VoteControls from "./components/VoteControls";
import Votes from "./components/Votes";
import VotingCards from "./components/VotingCards";

const VotingPanel = memo(() => {
  const transport = usePlanningPokerTransport();
  const valueSet = usePlanningPokerSelector(selectRoomValueSet);
  const selectedVote = usePlanningPokerSelector(selectCurrentVote);
  const revealed = usePlanningPokerSelector(selectRoomRevealed);
  const isModerator = usePlanningPokerSelector(selectIsModerator);
  const canReveal = usePlanningPokerSelector(selectCanReveal);
  const canReset = usePlanningPokerSelector(selectCanReset);
  const canRevoke = usePlanningPokerSelector(selectCanRevoke);

  if (!valueSet) return null;
  return (
    <section className="pp-panel" aria-labelledby="voting-heading">
      <h1 id="voting-heading" className="pp-title">
        Cast your estimate
      </h1>
      <ValueSetControl
        currentValueSet={valueSet}
        changeValueSet={transport.changeValueSet}
        isModerator={isModerator}
      />
      <VotingCards
        valueSet={votingValueSets[valueSet]}
        onVote={transport.vote}
        selectedVote={selectedVote}
        disabled={revealed}
      />
      <VoteControls
        onReset={transport.reset}
        onReveal={transport.reveal}
        onRevoke={transport.revoke}
        canReset={canReset}
        canReveal={canReveal}
        canRevoke={canRevoke}
        isModerator={isModerator}
      />
    </section>
  );
});
VotingPanel.displayName = "VotingPanel";

const ResultsPanel = memo(() => {
  const participants = usePlanningPokerSelector(selectParticipants);
  const revealed = usePlanningPokerSelector(selectRoomRevealed);
  return (
    <section
      className="pp-panel pp-results-panel pp-stack"
      aria-label="Voting results"
    >
      <Votes participants={participants} isRevealed={revealed} />
      <Statistics participants={participants} isRevealed={revealed} />
    </section>
  );
});
ResultsPanel.displayName = "ResultsPanel";

const ParticipantsPanel = memo(() => {
  const transport = usePlanningPokerTransport();
  const participants = usePlanningPokerSelector(selectParticipants);
  const participantId = usePlanningPokerSelector(selectCurrentParticipantId);
  if (!participantId) return null;
  return (
    <Participants
      participants={participants}
      currentUserId={participantId}
      kickOut={transport.kickOut}
      delegate={transport.delegate}
    />
  );
});
ParticipantsPanel.displayName = "ParticipantsPanel";

type RoomViewProps = {
  onLeave: () => void;
};

const RoomView = ({ onLeave }: RoomViewProps) => (
  <main className="pp-room-page">
    <div className="pp-room-layout">
      <div className="pp-room-column">
        <VotingPanel />
        <ResultsPanel />
      </div>
      <aside className="pp-room-column" aria-label="Room information">
        <RoomActionsPanel onLeave={onLeave} />
        <ParticipantsPanel />
      </aside>
    </div>
  </main>
);

const RoomActionsPanel = memo(({ onLeave }: RoomViewProps) => {
  const roomId = usePlanningPokerSelector(selectActiveRoomId);
  if (!roomId) return null;
  return <RoomControls roomId={roomId} onLeave={onLeave} />;
});
RoomActionsPanel.displayName = "RoomActionsPanel";

export default memo(RoomView);
