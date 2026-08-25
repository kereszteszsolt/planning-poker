# PP-006: Introduce a Zustand room-state boundary

## Status

Implementation complete; manual multi-browser smoke pending

## User story

As a frontend maintainer, I want shared connection, session, and room state managed through a small typed store so that socket subscriptions, reconnect behavior, moderator controls, and derived views are consistent without pushing every local UI detail into global state.

## Acceptance criteria

### Store design

- [x] A typed Zustand store is split into documented connection, session, room, and limited cross-component UI slices.
- [x] The store contains serializable state and pure state transitions; the live Socket.IO client is owned by an injected transport service rather than persisted in the store.
- [x] Room state is replaced from the server's canonical snapshot or normalized event result; conflicting duplicate client copies are removed.
- [x] Selectors expose current participant, moderator status, voted count, can-reveal, can-reset, can-revoke, numeric statistics inputs, and connection messages without recomputing unrelated UI.
- [x] Components subscribe to the smallest practical selectors and avoid whole-store rerenders.
- [x] Local input values, one-component menus, and temporary disclosure state remain in React state unless a documented cross-component need exists.

### Transport integration

- [x] One transport adapter maps typed Socket.IO events and acknowledgements to store actions.
- [x] Subscription startup and teardown are idempotent and safe under React Strict Mode.
- [x] Reconnect success applies the recovered or freshly fetched room snapshot exactly once.
- [x] Unrecoverable session loss clears stale participant identity before asking the user to rejoin.
- [x] Leave, kick, room close, and explicit return-home actions reset all room/session slices while retaining only safe global preferences.
- [x] Errors are normalized into stable store state rather than raw network exceptions scattered across components.

### Persistence and privacy

- [x] The store does not persist room snapshots, votes, participant lists, room tokens, or display names to `localStorage` by default.
- [x] Any allowed preference persistence is documented, versioned, and separated from session state.
- [x] Redux DevTools integration, when enabled, is development-only and reviewed for exposure of room data.

### UI migration

- [x] `RoomScreen` becomes route/orchestration composition rather than the sole owner of room lifecycle state.
- [x] Home, join, room, message, and status views use shared actions and selectors where state crosses route/component boundaries.
- [x] Existing value-set, voting, reveal, reset, revoke, participant, delegation, takeover, kick, close, and reconnect behavior remains covered during migration.
- [x] No component imports the Socket.IO client directly after migration except the approved transport/provider boundary.

### Verification

- [x] Store unit tests cover every action, selector, reset path, and invalid transition.
- [x] Transport tests prove listener registration/cleanup and acknowledgement normalization.
- [x] React tests prove that unrelated components do not rerender for irrelevant state changes where selectors are expected to isolate them.
- [ ] Multi-browser smoke confirms both clients converge on the same canonical room state after vote, reveal, reset, delegation, reconnect, and kick.

## Out of scope

Replacing server authority with client-only state, offline room editing, durable state persistence, Redux migration, or storing the raw socket in browser storage is out of scope.

## Implementation notes

Implemented shape:

```ts
type PlanningPokerState = {
  connection: ConnectionSlice;
  session: SessionSlice;
  room: RoomSlice;
  ui: UiSlice;
};
```

`PlanningPokerState` contains no action functions, live socket, persistence middleware, or development tooling. `reducePlanningPokerState` implements pure transitions, narrow selectors feed connected room panels, and `planning-poker-transport.ts` owns listener, acknowledgement, session-storage, and normalized-error effects. Tab-scoped reconnect identity remains in `sessionStorage`; `localStorage` is unused.

## Verification evidence

Targeted frontend typecheck and lint pass. The frontend suite currently passes 5 files and 12 tests, including transition/selector/reset/privacy coverage, transport listener and acknowledgement coverage, Strict Mode ownership, route-session recovery, and an explicit selector render-isolation assertion. The full root gate and development runtime smoke are recorded in [the verification report](../../../verification.md#pp-006-zustand-state-boundary-verification). A real multi-browser convergence smoke is still required before the final verification criterion can be checked.
