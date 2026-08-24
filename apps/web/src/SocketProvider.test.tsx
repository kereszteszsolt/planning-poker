import { StrictMode, useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SocketProvider } from "./SocketProvider";
import { resetApplicationSocketForTests } from "./socket-client";
import { SocketContext } from "./socket-context";
import { FakeSocket } from "./test/fake-socket";

const StatusProbe = () => {
  const context = useContext(SocketContext);
  return <span>{context?.status}</span>;
};

afterEach(() => resetApplicationSocketForTests());

describe("SocketProvider", () => {
  it("owns one socket through Strict Mode and removes the same listener references", async () => {
    const fake = new FakeSocket();
    const factory = vi.fn(() => fake.asApplicationSocket());
    const view = render(
      <StrictMode>
        <SocketProvider socketFactory={factory}>
          <StatusProbe />
        </SocketProvider>
      </StrictMode>,
    );

    expect(await screen.findByText("connected")).toBeInTheDocument();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(fake.listenerCount("connect")).toBe(1);
    expect(fake.listenerCount("disconnect")).toBe(1);
    expect(fake.manager.listenerCount("reconnect_attempt")).toBe(1);

    act(() => fake.trigger("disconnect", "transport close"));
    expect(screen.getByText("reconnecting")).toBeInTheDocument();
    act(() => fake.trigger("connect_error", new Error("temporary")));
    expect(screen.getByText("recoverable-error")).toBeInTheDocument();
    act(() => fake.manager.trigger("reconnect_failed"));
    expect(screen.getByText("server-unavailable")).toBeInTheDocument();
    act(() => fake.trigger("disconnect", "io server disconnect"));
    expect(screen.getByText("session-lost")).toBeInTheDocument();

    view.unmount();
    expect(fake.listenerCount("connect")).toBe(0);
    expect(fake.listenerCount("disconnect")).toBe(0);
    expect(fake.manager.listenerCount("reconnect_attempt")).toBe(0);
    expect(fake.disconnectCalls).toBeGreaterThan(0);
  });
});
