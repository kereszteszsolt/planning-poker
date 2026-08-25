export const fixedTime = 1_735_689_600_000;

export const roomIds = Object.freeze({
  create: "55555555-5555-4555-8555-555555555555",
  join: "11111111-1111-4111-8111-111111111111",
  voting: "22222222-2222-4222-8222-222222222222",
  results: "33333333-3333-4333-8333-333333333333",
  mobile: "44444444-4444-4444-8444-444444444444",
});

const participants = Object.freeze({
  ada: Object.freeze({
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Ada Moderator",
    isModerator: true,
  }),
  lin: Object.freeze({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Lin Participant",
    isModerator: false,
  }),
  grace: Object.freeze({
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Grace Observer",
    isModerator: false,
  }),
  sam: Object.freeze({
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    name: "Sam Developer",
    isModerator: false,
  }),
});

const sessionTokens = Object.freeze({
  [participants.ada.id]: "a0000000-0000-4000-8000-000000000001",
  [participants.lin.id]: "b0000000-0000-4000-8000-000000000002",
  [participants.grace.id]: "c0000000-0000-4000-8000-000000000003",
  [participants.sam.id]: "d0000000-0000-4000-8000-000000000004",
});

const participant = (identity, vote) => ({
  ...identity,
  voted: vote !== undefined,
  ...(vote !== undefined ? { vote } : {}),
});

const roomDefinitions = Object.freeze({
  [roomIds.voting]: Object.freeze({
    valueSet: "scrum",
    revealed: false,
    participants: Object.freeze([
      participant(participants.ada, 5),
      participant(participants.lin, 8),
      participant(participants.grace),
      participant(participants.sam, "?"),
    ]),
  }),
  [roomIds.results]: Object.freeze({
    valueSet: "scrum",
    revealed: true,
    participants: Object.freeze([
      participant(participants.ada, 5),
      participant(participants.lin, 8),
      participant(participants.grace, "?"),
      participant(participants.sam, "☕"),
    ]),
  }),
  [roomIds.mobile]: Object.freeze({
    valueSet: "fibonacci",
    revealed: false,
    participants: Object.freeze([
      participant(participants.ada, 8),
      participant(participants.lin, 5),
      participant(participants.grace),
    ]),
  }),
});

export const createFixtureRooms = () =>
  new Map(
    Object.entries(roomDefinitions).map(([id, definition]) => [
      id,
      {
        id,
        valueSet: definition.valueSet,
        revealed: definition.revealed,
        lastUpdated: fixedTime,
        participants: Object.fromEntries(
          definition.participants.map((entry) => [entry.id, { ...entry }]),
        ),
      },
    ]),
  );

export const findParticipantByName = (room, name) =>
  Object.values(room.participants).find(
    (entry) =>
      entry.name.toLocaleLowerCase("en-US") === name.toLocaleLowerCase("en-US"),
  );

export const sessionTokenFor = (participantId) =>
  sessionTokens[participantId] ?? "e0000000-0000-4000-8000-000000000005";
