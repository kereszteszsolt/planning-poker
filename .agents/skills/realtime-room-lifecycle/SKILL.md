---
name: realtime-room-lifecycle
description: Implement or review one approved Planning Poker room, participant, vote, moderation, Socket.IO, recovery, authorization, or cleanup change.
---

# Realtime room lifecycle

- Keep the server authoritative for rooms, participants, votes, reveal state, moderation, and timestamps.
- Validate every incoming event with the shared runtime schemas and boundary-specific checks.
- Derive authorization from the socket's current server-side membership; never trust a claimed participant ID.
- Keep vote values hidden before reveal while still exposing whether each participant has voted.
- Preserve `{ ok: true, data }` and `{ ok: false, error }` acknowledgement semantics.
- Broadcast a full canonical snapshot only after a successful mutation.
- Keep socket IDs, session tokens, join order, and internal records out of public snapshots.
- Keep recovery tokens short-lived and participant-specific; on resume move membership to the new socket, notify and detach the replaced socket, and revoke the token on kick, explicit leave, room deletion, or expiry.
- Remove both application membership and Socket.IO room membership on every exit path.
- Keep at most one moderator and use the documented deterministic handoff order.
- Delete empty and inactive rooms together with their associated sessions.
- Cover malformed payloads, unauthorized actions, duplicates, participant limits, reconnect races, expiry boundaries, and cleanup with tests.

Run focused server and contracts tests first, then `pnpm e2e` for a changed multi-client flow. Ask for commit approval separately.
