import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoomControls from "./RoomControls";
import Statistics from "./Statistics";

describe("room correctness fixes", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("copies a base-aware link without blocking alerts", async () => {
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);
    render(<RoomControls roomId="room-id" onLeave={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy Room Link" }));
    expect(await screen.findByText("Room link copied.")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      new URL("/room/room-id", window.location.origin).toString(),
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("documents and applies the mixed-vote numeric rule", () => {
    render(
      <Statistics
        isRevealed
        participants={{
          first: {
            id: "first",
            name: "Alice",
            voted: true,
            vote: 3,
            isModerator: true,
          },
          second: {
            id: "second",
            name: "Bob",
            voted: true,
            vote: "?",
            isModerator: false,
          },
        }}
      />,
    );
    expect(screen.getByText(/Average:/)).toHaveTextContent("3.00");
    expect(screen.getByText(/Special cards are shown/)).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
