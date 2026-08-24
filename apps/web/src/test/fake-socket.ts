import type { ApplicationSocket } from "../socket-context";

type Listener = (...arguments_: unknown[]) => void;
type OutgoingHandler = (
  payload: unknown,
  callback: (response: unknown) => void,
) => void;

class FakeManager {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener) {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(listener);
    this.listeners.set(event, listeners);
    return this;
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  trigger(event: string, ...arguments_: unknown[]) {
    for (const listener of this.listeners.get(event) ?? [])
      listener(...arguments_);
  }

  listenerCount(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export class FakeSocket {
  connected = false;
  connectCalls = 0;
  disconnectCalls = 0;
  readonly manager = new FakeManager();
  readonly io = this.manager;
  private listeners = new Map<string, Set<Listener>>();
  private outgoingHandlers = new Map<string, OutgoingHandler>();

  on(event: string, listener: Listener) {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(listener);
    this.listeners.set(event, listeners);
    return this;
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  connect() {
    this.connectCalls += 1;
    this.connected = true;
    this.trigger("connect");
    return this;
  }

  disconnect() {
    this.disconnectCalls += 1;
    this.connected = false;
    return this;
  }

  emit(event: string, payload: unknown, callback: (response: unknown) => void) {
    this.outgoingHandlers.get(event)?.(payload, callback);
    return this;
  }

  respondTo(event: string, handler: OutgoingHandler) {
    this.outgoingHandlers.set(event, handler);
  }

  trigger(event: string, ...arguments_: unknown[]) {
    for (const listener of this.listeners.get(event) ?? [])
      listener(...arguments_);
  }

  listenerCount(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }

  asApplicationSocket() {
    return this as unknown as ApplicationSocket;
  }
}
