# PP-004: Runtime and room lifecycle hardening

## Status

Implemented

## User story

As a facilitator and participant, I want room creation, joining, moderation, removal, leaving, disconnection, and reconnection to behave predictably so that a temporary network issue or malformed request does not corrupt the session or leave misleading participants behind.

## Problem statement

The current demo ties participant identity to `socket.id`, constructs the client socket during React render, accepts arbitrary room IDs and names, silently ignores unauthorized actions, keeps explicitly emptied rooms until inactivity cleanup, and removes kicked participants from the data record without forcing their socket to leave the Socket.IO room. Endpoints and CORS are hardcoded.

## Acceptance criteria

### Configuration and transport ownership

- [x] Backend host/port, allowed origins, and frontend Socket.IO endpoint or same-origin proxy target are configured through documented environment variables with safe local defaults.
- [x] Production configuration does not default to wildcard CORS.
- [x] The frontend creates exactly one Socket.IO client per application lifecycle, registers each listener once, removes listeners by the same handler reference, and disconnects during final teardown.
- [x] React Strict Mode does not create duplicate participant sessions or duplicate `room-updated` handling.
- [x] Connection status distinguishes initial connection, connected, reconnecting, recoverable failure, unrecoverable session loss, and server-unavailable states.

### Validation and acknowledgements

- [x] Room storage uses `Map` or another structure that cannot be affected by special object keys such as `__proto__`.
- [x] `create-room` is the only event that creates a new room; joining an unknown or expired room returns a typed, visible error unless a deliberate product decision documents otherwise.
- [x] Room IDs are validated as the chosen UUID format before lookup.
- [x] Display names are trimmed, have documented minimum/maximum lengths, reject control characters, and are compared consistently for duplicates.
- [x] Every client event has a shared success/error acknowledgement with stable error codes; unauthorized or malformed actions are not silently ignored.
- [x] A documented participant limit and server-side payload-size limits prevent unbounded room growth.

### Identity and reconnection

- [x] Participant identity is not dependent solely on an ephemeral `socket.id`; implement either a short-lived server session token, Socket.IO connection-state recovery plus a fallback identity, or another reviewed design.
- [x] Temporary disconnection recovery restores room membership and missed state when possible.
- [x] When recovery fails, the client requests and applies a fresh canonical snapshot or asks the user to rejoin without duplicating the old participant.
- [x] Rejoining never fails merely because the same recovering participant name is still present.
- [x] Room/session tokens are held in memory or session-scoped storage only; no vote or room snapshot is persisted to long-lived browser storage by default.

### Room lifecycle and moderation

- [x] Explicit leave removes the participant from both application room state and the Socket.IO room.
- [x] When the last participant leaves or disconnects, the room is deleted immediately and no longer accepts mutations.
- [x] A kicked participant is notified, forced to leave the Socket.IO room, removed from application state, prevented from further room mutations, and shown an actionable message.
- [x] Moderator departure follows one documented rule: deterministic transfer to an eligible participant or an explicit, race-safe takeover flow.
- [x] At most one participant has `isModerator=true` after every transition.
- [x] Delegation cannot target the requester, a missing participant, or an invalid room state.
- [x] Inactivity cleanup updates and closes rooms deterministically, emits closure before teardown when required, and is testable with an injected clock or configurable short interval.

### Correctness and UX defects

- [x] The About page renders emphasis correctly and explains that TLS protection depends on deployment.
- [x] Clipboard actions handle success and failure without blocking `alert()` calls.
- [x] Numeric statistics have one documented rule for mixed numeric/special votes; tests and user copy agree with that rule.
- [x] Room links are generated correctly under local root hosting and any supported deployment base path.

### Verification

- [x] Focused server integration tests cover all room mutations, malformed payloads, authorization failures, leave/disconnect, kick, delegation, moderator departure, reconnection, and cleanup.
- [x] Focused React tests prove one transport instance, listener cleanup, status transitions, retry/rejoin behavior, and user-visible acknowledgement errors.
- [x] Manual smoke tests use at least three isolated browser contexts and include moderator disconnect plus participant removal.

## Out of scope

Accounts, password authentication, durable persistence, public room discovery, Redis adapters, horizontal scaling, backlog content, and long-term estimation history are out of scope.

## Implementation notes

- Treat connection recovery as an optimization, not a guarantee. The client still needs a full resynchronization path.
- Do not expose internal exception text to users. Map errors to stable public codes and actionable copy.
- Keep the server authoritative. Optimistic UI may indicate a pending action but must reconcile to the acknowledged room snapshot.
- Add tests before restructuring the repository in PP-005 so behavior can be compared across the move.

## Verification evidence

Environment:

- Automated checks: `node:22.22.0-bookworm-slim`.
- Browser smoke: `mcr.microsoft.com/playwright:v1.62.1-noble`, headless Chromium, three isolated browser contexts.
- Runtime defaults and every supported override are recorded in `planning-poker-be/.env.example`, `planning-poker-fe/.env.example`, and `docs/development.md`.

Commands and results:

- Backend: clean `npm ci && npm test && npm audit --omit=dev` passed; TypeScript build passed, 5/5 Socket.IO integration tests passed, and the production dependency audit reported 0 vulnerabilities.
- Frontend: clean `npm ci && npm run lint && npm test && npm run build && npm audit --omit=dev` passed; ESLint passed, 3 Vitest files with 5/5 tests passed, the Vite production build transformed 90 modules, and the production dependency audit reported 0 vulnerabilities.
- Browser: an ephemeral Playwright 1.62.1 script created Alice, Bob, and Carol in separate contexts, delegated moderation to Bob, closed Bob's context, verified deterministic transfer back to Alice, kicked Carol and observed the actionable kicked screen, left as the final participant, and verified that the expired room rejected a new join. Result: `BROWSER_SMOKE_OK contexts=3 moderator_disconnect=pass kick=pass empty_room=pass`.
- Repository checks: `git diff --check`, local Markdown link validation, and JSON validation passed.

Lifecycle traces covered by the integration suite:

- Unknown or malformed room IDs never create storage entries; only `create-room` allocates a UUID-keyed `Map` record.
- Disconnect removes the active participant immediately, transfers the moderator deterministically, and permits token recovery with the same participant UUID while the room and capacity remain available.
- Kick notifies the target before forcing its socket out, revokes recovery, and rejects later mutations as `NOT_A_PARTICIPANT`.
- Last leave/disconnect deletes the room immediately; injected-clock inactivity cleanup emits closure before teardown.

## Comments

- Session tokens remain only in server memory and browser `sessionStorage`; room snapshots and votes are not persisted client-side.
- PP-005 can now move the duplicated event/type declarations into a shared workspace package while preserving the tested PP-004 wire semantics.
