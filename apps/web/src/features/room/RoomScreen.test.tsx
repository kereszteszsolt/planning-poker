import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeRoomSession } from "../../shared/room-session";
import type { Room } from "@planning-poker/contracts";
import { FakeSocket } from "../../test/fake-socket";
import RoomScreen from "./RoomScreen";
import { PlanningPokerStoreProvider } from "../../state/PlanningPokerStoreProvider";
import { SocketProvider } from "../../SocketProvider";
import { resetApplicationSocketForTests } from "../../socket-client";

const roomId = "70d27440-40d7-4a4b-bc2f-30935060dc8d";
const participant = {
  id: "cc220b09-3714-4da4-904f-087b06a96b82",
  name: "Alice",
  voted: false,
  isModerator: true,
};
const room: Room = {
  id: roomId,
  valueSet: "scrum",
  participants: { [participant.id]: participant },
  revealed: false,
  lastUpdated: 1,
};

const renderRoom = (fake: FakeSocket) =>
  render(
    <PlanningPokerStoreProvider>
      <SocketProvider socketFactory={() => fake.asApplicationSocket()}>
        <MemoryRouter initialEntries={[`/room/${roomId}`]}>
          <Routes>
            <Route path="/room/:roomId" element={<RoomScreen />} />
            <Route
              path="/message/:messageType"
              element={<span>message</span>}
            />
          </Routes>
        </MemoryRouter>
      </SocketProvider>
    </PlanningPokerStoreProvider>,
  );

beforeEach(() => window.sessionStorage.clear());
afterEach(() => resetApplicationSocketForTests());

describe("RoomScreen session recovery", () => {
  it("rejoins with the session token, applies the canonical snapshot, and retries on connect", async () => {
    const fake = new FakeSocket();
    fake.connected = true;
    const requests: unknown[] = [];
    fake.respondTo("join-room", (payload, callback) => {
      requests.push(payload);
      callback({
        ok: true,
        data: { participant, sessionToken: "token", room },
      });
    });
    writeRoomSession({
      roomId,
      participantId: participant.id,
      name: participant.name,
      sessionToken: "token",
    });

    renderRoom(fake);
    expect(await screen.findByText("You")).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      roomId,
      name: "Alice",
      sessionToken: "token",
    });

    fake.trigger("connect");
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1]).toMatchObject({ sessionToken: "token" });
  });

  it("shows acknowledgement errors instead of silently ignoring a failed join", async () => {
    const fake = new FakeSocket();
    fake.connected = true;
    fake.respondTo("join-room", (_payload, callback) => {
      callback({
        ok: false,
        error: {
          code: "NAME_TAKEN",
          message: "That name is already in use.",
          recoverable: true,
        },
      });
    });
    renderRoom(fake);

    fireEvent.change(screen.getByPlaceholderText("Enter your name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Join Room" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That name is already in use.",
    );
  });
});
