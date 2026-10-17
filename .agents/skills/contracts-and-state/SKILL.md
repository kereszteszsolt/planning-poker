---
name: contracts-and-state
description: Use for Planning Poker TypeScript event payloads, Zod runtime contracts, Socket.IO acknowledgement/transport boundaries and Zustand state updates.
---

# Typed events and state synchronization

- Read `packages/contracts`, server emit/ack handlers, the client socket adapter and impacted Zustand slices only as needed.
- Keep **one** public event/type/schema declaration; runtime-validate untrusted data server-side regardless of static TypeScript types.
- Preserve stable acknowledgement response/error contracts, canonical public snapshots, and server-only privacy fields.
- Keep live socket/listener logic outside React components and raw socket objects out of serializable store state.
- Test event order, malformed payloads, replay/reconnect, optimistic update rollback where applicable, and listener cleanup.
- Update both client and server tests for a shared contract change; avoid parallel copies of schemas.
