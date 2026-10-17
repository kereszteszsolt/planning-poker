---
name: realtime-room-lifecycle
description: Use for server-owned Socket.IO membership, authorization, reconnect/recovery sessions, expiration, moderation, cleanup and room lifecycle invariants.
---

# Socket.IO server lifecycle

- Follow `docs/architecture.md` for current server state and trust boundary; inspect room handlers and targeted tests.
- Authorize actions from live socket membership, not a claimed client participant ID; validate names, IDs and payload limits.
- Keep private vote choices and recovery tokens out of public snapshots and logs; broadcast state after successful validated mutation.
- Keep application membership and Socket.IO room subscriptions synchronized on kick, leave, disconnect, replace and expiration.
- Guarantee deterministic moderator state and delete empty/expired rooms and associated sessions.
- Cover invalid event, concurrent/repeated mutation, reconnect, cleanup and error acknowledgements with focused server tests.
- Preserve in-memory, single-process behavior unless an explicit architecture story changes it.
