---
name: contracts-and-state
description: Implement or review one approved Planning Poker shared-contract, Socket transport, Zustand, recovery-state, or client/server event change.
---

# Contracts and state

- Keep one shared definition for public events, payloads, acknowledgements, errors, value sets, limits, and room snapshots.
- Pair TypeScript types with runtime schemas for all untrusted client payloads.
- Treat protocol changes as coordinated server, transport, state, test, and documentation changes.
- Keep the live Socket.IO object and subscriptions in the injected transport boundary.
- Keep Zustand data serializable and actions outside the stored data shape.
- Keep transient form, clipboard, and one-component disclosure state local to components.
- Register each transport listener once and release it during final provider cleanup.
- Normalize public failures before they enter UI state.
- On recovery, use the stored token only through the join contract and replace local room state with the latest canonical snapshot.
- Clear stale room, session, and forced-exit state on the documented leave, kick, close, expiry, and replacement paths.
- Test reducer transitions separately from transport side effects and use a fake socket for deterministic client tests.
- Reject duplicated event names, copied interfaces, persisted sockets, hidden storage writes, and components that call the socket directly.

Run contracts, web-state, transport, and integration checks according to the changed boundary. Ask for commit approval separately.
