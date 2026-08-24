# PP-006: Introduce a Zustand room-state boundary

## Status

Planned

## User story

As a frontend maintainer, I want shared connection, session, and room state managed through a small typed store so that socket subscriptions, reconnect behavior, moderator controls, and derived views are consistent without pushing every local UI detail into global state.

## Acceptance criteria

### Store design

- [ ] A typed Zustand store is split into documented connection, session, room, and limited cross-component UI slices.
- [ ] The store contains serializable state and pure state transitions; the live Socket.IO client is owned by an injected transport service rather than persisted in the store.
- [ ] Room state is replaced from the server's canonical snapshot or normalized event result; conflicting duplicate client copies are removed.
- [ ] Selectors expose current participant, moderator status, voted count, can-reveal, can-reset, can-revoke, numeric statistics inputs, and connection messages without recomputing unrelated UI.
- [ ] Components subscribe to the smallest practical selectors and avoid whole-store rerenders.
- [ ] Local input values, one-component menus, and temporary disclosure state remain in React state unless a documented cross-component need exists.

### Transport integration

- [ ] One transport adapter maps typed Socket.IO events and acknowledgements to store actions.
- [ ] Subscription startup and teardown are idempotent and safe under React Strict Mode.
- [ ] Reconnect success applies the recovered or freshly fetched room snapshot exactly once.
- [ ] Unrecoverable session loss clears stale participant identity before asking the user to rejoin.
- [ ] Leave, kick, room close, and explicit return-home actions reset all room/session slices while retaining only safe global preferences.
- [ ] Errors are normalized into stable store state rather than raw network exceptions scattered across components.

### Persistence and privacy

- [ ] The store does not persist room snapshots, votes, participant lists, room tokens, or display names to `localStorage` by default.
- [ ] Any allowed preference persistence is documented, versioned, and separated from session state.
- [ ] Redux DevTools integration, when enabled, is development-only and reviewed for exposure of room data.

### UI migration

- [ ] `RoomScreen` becomes route/orchestration composition rather than the sole owner of room lifecycle state.
- [ ] Home, join, room, message, and status views use shared actions and selectors where state crosses route/component boundaries.
- [ ] Existing value-set, voting, reveal, reset, revoke, participant, delegation, takeover, kick, close, and reconnect behavior remains covered during migration.
- [ ] No component imports the Socket.IO client directly after migration except the approved transport/provider boundary.

### Verification

- [ ] Store unit tests cover every action, selector, reset path, and invalid transition.
- [ ] Transport tests prove listener registration/cleanup and acknowledgement normalization.
- [ ] React tests prove that unrelated components do not rerender for irrelevant state changes where selectors are expected to isolate them.
- [ ] Multi-browser smoke confirms both clients converge on the same canonical room state after vote, reveal, reset, delegation, reconnect, and kick.

## Out of scope

Replacing server authority with client-only state, offline room editing, durable state persistence, Redux migration, or storing the raw socket in browser storage is out of scope.

## Implementation notes

Suggested shape:

```ts
type PlanningPokerState =
  & ConnectionSlice
  & SessionSlice
  & RoomSlice
  & UiSlice;
```

Use slice composition only where it clarifies ownership. A single small store is preferable to ceremony-heavy abstractions. Document why each field is global.

## Verification evidence

To be completed with store schema, selector map, test counts, render/profiling evidence where relevant, reconnect traces, and privacy review notes.
