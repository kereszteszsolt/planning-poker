import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { Room } from "@planning-poker/contracts";
import HomeScreen from "./HomeScreen";
import MessageScreen from "./MessageScreen";
import RoomView from "./room/RoomView";
import { PlanningPokerStoreProvider } from "../state/PlanningPokerStoreProvider";
import {
  createPlanningPokerStateController,
  createPlanningPokerStore,
} from "../state/planning-poker-store";
import { PlanningPokerTransportContext } from "../transport/transport-context";
import type { PlanningPokerTransport } from "../transport/planning-poker-transport";

const roomId = "70d27440-40d7-4a4b-bc2f-30935060dc8d";
const moderatorId = "cc220b09-3714-4da4-904f-087b06a96b82";
const participantId = "7c692055-ed28-460f-b686-6c0ee9e1e2bd";

const createTransport = (overrides: Partial<PlanningPokerTransport> = {}) =>
  ({
    start: vi.fn(() => vi.fn()),
    activateRoom: vi.fn(),
    createRoom: vi.fn(async () => roomId),
    joinRoom: vi.fn(),
    vote: vi.fn(),
    revoke: vi.fn(),
    reveal: vi.fn(),
    reset: vi.fn(),
    changeValueSet: vi.fn(),
    delegate: vi.fn(),
    kickOut: vi.fn(),
    leaveRoom: vi.fn(async () => true),
    returnHome: vi.fn(),
    retryConnection: vi.fn(),
    ...overrides,
  }) satisfies PlanningPokerTransport;

const renderWithBoundary = (
  children: ReactNode,
  transport = createTransport(),
  initialEntries = ["/"],
) => {
  const store = createPlanningPokerStore();
  createPlanningPokerStateController(store).setConnectionStatus("connected");
  return {
    store,
    transport,
    ...render(
      <PlanningPokerStoreProvider store={store}>
        <PlanningPokerTransportContext.Provider value={transport}>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </PlanningPokerTransportContext.Provider>
      </PlanningPokerStoreProvider>,
    ),
  };
};

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("screen and route flows", () => {
  it("creates a room, validates the join control, and supports keyboard navigation", async () => {
    const transport = createTransport();
    renderWithBoundary(
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/room/:roomId" element={<p>room route</p>} />
      </Routes>,
      transport,
    );

    const joinButton = screen.getByRole("button", { name: "Join Room" });
    expect(joinButton).toBeDisabled();
    const roomInput = screen.getByLabelText("Room ID");
    fireEvent.change(roomInput, { target: { value: ` ${roomId} ` } });
    expect(joinButton).toBeEnabled();
    fireEvent.submit(roomInput.closest("form")!);
    expect(await screen.findByText("room route")).toBeInTheDocument();

    expect(transport.returnHome).toHaveBeenCalledOnce();
  });

  it("creates and routes to the acknowledged room", async () => {
    const transport = createTransport();
    renderWithBoundary(
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/room/:roomId" element={<p>created room route</p>} />
      </Routes>,
      transport,
    );
    fireEvent.click(screen.getByRole("button", { name: "Create Room" }));
    expect(await screen.findByText("created room route")).toBeInTheDocument();
    expect(transport.createRoom).toHaveBeenCalledOnce();
  });

  it.each([
    ["closed", "Room Closed"],
    ["kicked-out", "Kicked Out"],
    ["session-replaced", "Session Moved"],
    ["other", "Unknown Message"],
  ])("renders the %s terminal route and returns home", (messageType, title) => {
    const transport = createTransport();
    renderWithBoundary(
      <Routes>
        <Route path="/" element={<p>home route</p>} />
        <Route path="/message/:messageType" element={<MessageScreen />} />
      </Routes>,
      transport,
      [`/message/${messageType}`],
    );
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to Home" }));
    expect(screen.getByText("home route")).toBeInTheDocument();
    expect(transport.returnHome).toHaveBeenCalledOnce();
  });

  it("composes the complete room and maps accessible controls to transport actions", async () => {
    const transport = createTransport();
    const { store } = renderWithBoundary(
      <RoomView onLeave={vi.fn()} />,
      transport,
    );
    const room: Room = {
      id: roomId,
      valueSet: "scrum",
      revealed: false,
      lastUpdated: 1,
      participants: {
        [moderatorId]: {
          id: moderatorId,
          name: "Ada Moderator",
          voted: true,
          vote: 3,
          isModerator: true,
        },
        [participantId]: {
          id: participantId,
          name: "Lin Participant",
          voted: false,
          isModerator: false,
        },
      },
    };
    createPlanningPokerStateController(store).activateRoom(roomId, null);
    createPlanningPokerStateController(store).acceptSession(
      {
        roomId,
        participantId: moderatorId,
        name: "Ada Moderator",
        sessionToken: "session-token",
      },
      room,
    );

    expect(
      await screen.findByRole("heading", { name: "Cast your estimate" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Voting results" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Room information" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(transport.vote).toHaveBeenCalledWith(5);
    fireEvent.click(screen.getByRole("radio", { name: "fibonacci" }));
    expect(transport.changeValueSet).toHaveBeenCalledWith("fibonacci");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Make Lin Participant the moderator",
      }),
    );
    expect(transport.delegate).toHaveBeenCalledWith(participantId);
    fireEvent.click(screen.getByRole("button", { name: "Copy Room ID" }));
    expect(await screen.findByText("Room ID copied.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset Votes" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reset Votes" })).toHaveFocus(),
    );
  });
});
