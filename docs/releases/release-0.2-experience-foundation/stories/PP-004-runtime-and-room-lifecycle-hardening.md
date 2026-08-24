# PP-004: Runtime and room lifecycle hardening

## Status

Planned

## User story

As a facilitator and participant, I want room creation, joining, moderation, removal, leaving, disconnection, and reconnection to behave predictably so that a temporary network issue or malformed request does not corrupt the session or leave misleading participants behind.

## Problem statement

The current demo ties participant identity to `socket.id`, constructs the client socket during React render, accepts arbitrary room IDs and names, silently ignores unauthorized actions, keeps explicitly emptied rooms until inactivity cleanup, and removes kicked participants from the data record without forcing their socket to leave the Socket.IO room. Endpoints and CORS are hardcoded.

## Acceptance criteria

### Configuration and transport ownership

- [ ] Backend host/port, allowed origins, and frontend Socket.IO endpoint or same-origin proxy target are configured through documented environment variables with safe local defaults.
- [ ] Production configuration does not default to wildcard CORS.
- [ ] The frontend creates exactly one Socket.IO client per application lifecycle, registers each listener once, removes listeners by the same handler reference, and disconnects during final teardown.
- [ ] React Strict Mode does not create duplicate participant sessions or duplicate `room-updated` handling.
- [ ] Connection status distinguishes initial connection, connected, reconnecting, recoverable failure, unrecoverable session loss, and server-unavailable states.

### Validation and acknowledgements

- [ ] Room storage uses `Map` or another structure that cannot be affected by special object keys such as `__proto__`.
- [ ] `create-room` is the only event that creates a new room; joining an unknown or expired room returns a typed, visible error unless a deliberate product decision documents otherwise.
- [ ] Room IDs are validated as the chosen UUID format before lookup.
- [ ] Display names are trimmed, have documented minimum/maximum lengths, reject control characters, and are compared consistently for duplicates.
- [ ] Every client event has a shared success/error acknowledgement with stable error codes; unauthorized or malformed actions are not silently ignored.
- [ ] A documented participant limit and server-side payload-size limits prevent unbounded room growth.

### Identity and reconnection

- [ ] Participant identity is not dependent solely on an ephemeral `socket.id`; implement either a short-lived server session token, Socket.IO connection-state recovery plus a fallback identity, or another reviewed design.
- [ ] Temporary disconnection recovery restores room membership and missed state when possible.
- [ ] When recovery fails, the client requests and applies a fresh canonical snapshot or asks the user to rejoin without duplicating the old participant.
- [ ] Rejoining never fails merely because the same recovering participant name is still present.
- [ ] Room/session tokens are held in memory or session-scoped storage only; no vote or room snapshot is persisted to long-lived browser storage by default.

### Room lifecycle and moderation

- [ ] Explicit leave removes the participant from both application room state and the Socket.IO room.
- [ ] When the last participant leaves or disconnects, the room is deleted immediately and no longer accepts mutations.
- [ ] A kicked participant is notified, forced to leave the Socket.IO room, removed from application state, prevented from further room mutations, and shown an actionable message.
- [ ] Moderator departure follows one documented rule: deterministic transfer to an eligible participant or an explicit, race-safe takeover flow.
- [ ] At most one participant has `isModerator=true` after every transition.
- [ ] Delegation cannot target the requester, a missing participant, or an invalid room state.
- [ ] Inactivity cleanup updates and closes rooms deterministically, emits closure before teardown when required, and is testable with an injected clock or configurable short interval.

### Correctness and UX defects

- [ ] The About page renders emphasis correctly and explains that TLS protection depends on deployment.
- [ ] Clipboard actions handle success and failure without blocking `alert()` calls.
- [ ] Numeric statistics have one documented rule for mixed numeric/special votes; tests and user copy agree with that rule.
- [ ] Room links are generated correctly under local root hosting and any supported deployment base path.

### Verification

- [ ] Focused server integration tests cover all room mutations, malformed payloads, authorization failures, leave/disconnect, kick, delegation, moderator departure, reconnection, and cleanup.
- [ ] Focused React tests prove one transport instance, listener cleanup, status transitions, retry/rejoin behavior, and user-visible acknowledgement errors.
- [ ] Manual smoke tests use at least three isolated browser contexts and include moderator disconnect plus participant removal.

## Out of scope

Accounts, password authentication, durable persistence, public room discovery, Redis adapters, horizontal scaling, backlog content, and long-term estimation history are out of scope.

## Implementation notes

- Treat connection recovery as an optimization, not a guarantee. The client still needs a full resynchronization path.
- Do not expose internal exception text to users. Map errors to stable public codes and actionable copy.
- Keep the server authoritative. Optimistic UI may indicate a pending action but must reconcile to the acknowledged room snapshot.
- Add tests before restructuring the repository in PP-005 so behavior can be compared across the move.

## Verification evidence

To be completed with exact commands, test counts, browser scenarios, environment-variable examples, and before/after lifecycle traces.
