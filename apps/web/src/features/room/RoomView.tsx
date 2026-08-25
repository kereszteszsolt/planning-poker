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
    <div className="p-4 md:p-6 bg-white rounded-lg shadow w-full">
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
    </div>
  );
});
VotingPanel.displayName = "VotingPanel";

const ResultsPanel = memo(() => {
  const participants = usePlanningPokerSelector(selectParticipants);
  const revealed = usePlanningPokerSelector(selectRoomRevealed);
  return (
    <div className="flex flex-col p-4 md:p-6 bg-white rounded-lg shadow w-full gap-4">
      <Votes participants={participants} isRevealed={revealed} />
      <Statistics participants={participants} isRevealed={revealed} />
    </div>
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
  <div
    className="flex flex-col md:flex-row justify-center items-start w-full gap-4 p-2 md:p-4"
    style={{ minHeight: "calc(100vh - 64px)", background: "#f8fbff" }}
  >
    <div className="flex flex-col w-full md:w-3/4 lg:w-2/3 xl:w-1/2 gap-4">
      <VotingPanel />
      <ResultsPanel />
    </div>
    <div className="flex flex-col w-full md:w-1/4 lg:w-1/3 xl:w-1/4 gap-4">
      <RoomActionsPanel onLeave={onLeave} />
      <ParticipantsPanel />
    </div>
  </div>
);

const RoomActionsPanel = memo(({ onLeave }: RoomViewProps) => {
  const roomId = usePlanningPokerSelector(selectActiveRoomId);
  if (!roomId) return null;
  return <RoomControls roomId={roomId} onLeave={onLeave} />;
});
RoomActionsPanel.displayName = "RoomActionsPanel";

export default memo(RoomView);
