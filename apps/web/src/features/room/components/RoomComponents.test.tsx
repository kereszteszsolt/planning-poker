import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Join from "./Join";
import RoomControls from "./RoomControls";
import Participants from "./Participants";
import Statistics from "./Statistics";
import VoteControls from "./VoteControls";
import VotingCards from "./VotingCards";

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

  it("associates the join label and error and submits the form by keyboard", () => {
    const onJoin = vi.fn();
    const { rerender } = render(
      <Join roomId="a-very-long-room-id" onJoin={onJoin} />,
    );
    const name = screen.getByLabelText("Your name");
    expect(name).toHaveFocus();
    fireEvent.change(name, { target: { value: "Alice" } });
    fireEvent.submit(name.closest("form")!);
    expect(onJoin).toHaveBeenCalledWith("Alice");

    rerender(
      <Join
        roomId="a-very-long-room-id"
        onJoin={onJoin}
        error="That name is already in use."
      />,
    );
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("That name is already in use.");
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

  it("exposes selected voting state without relying on color", () => {
    const onVote = vi.fn();
    render(
      <VotingCards valueSet={[1, 2, "?"]} selectedVote={2} onVote={onVote} />,
    );

    expect(screen.getByRole("button", { name: "2, selected" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Selected ✓")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onVote).toHaveBeenCalledWith(1);
  });

  it("confirms disruptive moderator actions before invoking them", () => {
    const onReset = vi.fn();
    const kickOut = vi.fn();
    const participants = {
      moderator: {
        id: "moderator",
        name: "Moderator",
        voted: false,
        isModerator: true,
      },
      participant: {
        id: "participant",
        name: "A participant with a long display name",
        voted: true,
        isModerator: false,
      },
    };

    const { rerender } = render(
      <Participants
        participants={participants}
        currentUserId="moderator"
        kickOut={kickOut}
        delegate={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove A participant with a long display name from the room",
      }),
    );
    expect(kickOut).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm removal" }));
    expect(kickOut).toHaveBeenCalledWith("participant");

    rerender(
      <VoteControls isModerator canReset onReset={onReset} canRevoke={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset Votes" }));
    expect(onReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm reset" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("passes an automated accessibility audit for the core controls", async () => {
    const joinView = render(<Join roomId="room-id" onJoin={vi.fn()} />);
    const joinAudit = await axe.run(joinView.container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(joinAudit.violations.map(({ id }) => id)).toEqual([]);
    joinView.unmount();

    const controlsView = render(
      <main>
        <VotingCards valueSet={[1, 2, "?"]} selectedVote={2} onVote={vi.fn()} />
        <VoteControls
          isModerator
          canReveal
          canReset
          canRevoke
          onReveal={vi.fn()}
          onReset={vi.fn()}
          onRevoke={vi.fn()}
        />
        <RoomControls roomId="room-id" onLeave={vi.fn()} />
        <Participants
          currentUserId="moderator"
          kickOut={vi.fn()}
          delegate={vi.fn()}
          participants={{
            moderator: {
              id: "moderator",
              name: "Moderator",
              voted: true,
              isModerator: true,
            },
          }}
        />
      </main>,
    );
    const controlsAudit = await axe.run(controlsView.container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(controlsAudit.violations.map(({ id }) => id)).toEqual([]);
  });
});
