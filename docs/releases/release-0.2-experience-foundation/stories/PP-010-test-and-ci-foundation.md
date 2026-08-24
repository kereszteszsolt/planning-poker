# PP-010: Establish automated tests and CI evidence

## Status

Planned

## User story

As a maintainer, I want the critical real-time, state, responsive, and build boundaries checked automatically so that Release 0.2 does not trade visible improvements for fragile room behavior.

## Acceptance criteria

### Frontend unit and integration tests

- [ ] Vitest and React Testing Library cover home, join, room composition, voting cards, controls, participant actions, statistics, status messages, clipboard feedback, and terminal message routes.
- [ ] Zustand actions, selectors, reset paths, and transport subscription cleanup are tested directly.
- [ ] Tests cover Strict Mode mounting, duplicate-listener prevention, recoverable/unrecoverable reconnect, kick, close, leave, and route transitions.
- [ ] Accessibility assertions cover labels, roles, names, disabled states, live regions, focus movement, and keyboard operation.

### Server and Socket.IO integration tests

- [ ] Tests start an ephemeral server on a random port and connect real Socket.IO clients.
- [ ] The suite covers create, known/unknown join, duplicate and invalid names, all value sets, vote, revoke, auto reveal, early reveal, reset, delegation, removal, leave, disconnect, moderator handoff, reconnect, room close, and inactivity cleanup.
- [ ] Malformed payloads, invalid room IDs, invalid values, unauthorized moderation, stale participant tokens, over-capacity rooms, and post-kick mutations return stable errors and do not corrupt state.
- [ ] Fake timers or an injected clock make cleanup tests fast and deterministic.
- [ ] Tests assert that at most one moderator exists and empty rooms are deleted.

### End-to-end and visual smoke

- [ ] Playwright uses multiple isolated contexts to exercise a real moderator and participants through the browser UI.
- [ ] Core desktop and mobile flows pass without console errors, uncaught page errors, horizontal overflow, or inaccessible blocking dialogs.
- [ ] Screenshot scenarios from PP-009 run in the same pinned environment and intentional baseline changes are reviewed.

### CI and repository gate

- [ ] GitHub Actions installs from a clean checkout with the supported Node.js version and one root `npm ci`.
- [ ] CI runs root `lint`, `typecheck`, `test`, `build`, and deterministic screenshot/visual checks using the same scripts documented locally.
- [ ] Turbo cache configuration does not mask missing outputs; at least one clean/no-cache verification is part of release evidence.
- [ ] Workflow concurrency cancels obsolete branch runs without cancelling protected release verification.
- [ ] Test and build artifacts needed for diagnosis are retained for failed runs without uploading private data.
- [ ] Dependency, license, secret, and generated-file checks are included only when configured and actionable; no decorative always-green job is added.
- [ ] `git diff --check`, broken relative Markdown links, JSON parsing, and the portable SVG render are part of repository verification.

### Release evidence

- [ ] Each implemented story records exact commands, environment, counts, and focused evidence.
- [ ] `docs/testing.md` is updated from “no automated baseline” to the real suite map and troubleshooting steps.
- [ ] `CHANGELOG.md` and release README contain only results reproduced from the final commit.
- [ ] A clean release-candidate run passes twice: once without cache and once with normal cache behavior.

## Out of scope

Arbitrary line-coverage targets, load testing for large public deployments, penetration certification, Redis/multi-node tests, or paid CI services are out of scope.

## Implementation notes

Prefer behavior-focused tests over snapshots of implementation details. A small number of reviewed visual baselines complements, but does not replace, semantic assertions and real Socket.IO integration tests.

## Verification evidence

To be completed with workflow links or logs, task summaries, test counts, durations, clean/no-cache results, artifact list, and release-candidate commit identifier.
