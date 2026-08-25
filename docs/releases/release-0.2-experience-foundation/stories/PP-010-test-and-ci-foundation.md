# PP-010: Establish automated tests and CI evidence

## Status

Implemented and locally verified

## User story

As a maintainer, I want the critical real-time, state, responsive, and build boundaries checked automatically so that Release 0.2 does not trade visible improvements for fragile room behavior.

## Acceptance criteria

### Frontend unit and integration tests

- [x] Vitest and React Testing Library cover home, join, room composition, voting cards, controls, participant actions, statistics, status messages, clipboard feedback, and terminal message routes.
- [x] Zustand actions, selectors, reset paths, and transport subscription cleanup are tested directly.
- [x] Tests cover Strict Mode mounting, duplicate-listener prevention, recoverable/unrecoverable reconnect, kick, close, leave, and route transitions.
- [x] Accessibility assertions cover labels, roles, names, disabled states, live regions, focus movement, and keyboard operation.

### Server and Socket.IO integration tests

- [x] Tests start an ephemeral server on a random port and connect real Socket.IO clients.
- [x] The suite covers create, known/unknown join, duplicate and invalid names, all value sets, vote, revoke, auto reveal, early reveal, reset, delegation, removal, leave, disconnect, moderator handoff, reconnect, room close, and inactivity cleanup.
- [x] Malformed payloads, invalid room IDs, invalid values, unauthorized moderation, stale participant tokens, over-capacity rooms, and post-kick mutations return stable errors and do not corrupt state.
- [x] Fake timers or an injected clock make cleanup tests fast and deterministic.
- [x] Tests assert that at most one moderator exists and empty rooms are deleted.

### End-to-end and visual smoke

- [x] Playwright uses multiple isolated contexts to exercise a real moderator and participants through the browser UI.
- [x] Core desktop and mobile flows pass without console errors, uncaught page errors, horizontal overflow, or inaccessible blocking dialogs.
- [x] Screenshot scenarios from PP-009 run in the same pinned environment and intentional baseline changes are reviewed.

### CI and repository gate

- [x] GitHub Actions enables Corepack and installs from a clean checkout with the supported Node.js version and one root `pnpm install --frozen-lockfile`.
- [x] CI runs root `lint`, `typecheck`, `test`, `build`, and deterministic screenshot/visual checks using the same scripts documented locally.
- [x] Turbo cache configuration does not mask missing outputs; at least one clean/no-cache verification is part of release evidence.
- [x] Workflow concurrency cancels obsolete branch runs without cancelling protected release verification.
- [x] Test and build artifacts needed for diagnosis are retained for failed runs without uploading private data.
- [x] Dependency, license, secret, and generated-file checks are included only when configured and actionable; no decorative always-green job is added.
- [x] `git diff --check`, broken relative Markdown links, JSON parsing, and the portable SVG render are part of repository verification.

### Release evidence

- [x] Each implemented story records exact commands, environment, counts, and focused evidence.
- [x] `docs/testing.md` is updated from “no automated baseline” to the real suite map and troubleshooting steps.
- [x] `CHANGELOG.md` and release README contain only results reproduced from the final commit.
- [x] A clean release-candidate run passes twice: once without cache and once with normal cache behavior.

## Out of scope

Arbitrary line-coverage targets, load testing for large public deployments, penetration certification, Redis/multi-node tests, or paid CI services are out of scope.

## Implementation notes

Prefer behavior-focused tests over snapshots of implementation details. A small number of reviewed visual baselines complements, but does not replace, semantic assertions and real Socket.IO integration tests.

## Verification evidence

Local verification used `mcr.microsoft.com/playwright:v1.62.1-noble`, exact `@playwright/test` `1.62.1`, Node.js `24.18.1` supplied by that image, Corepack, pnpm `11.23.0`, Chromium, `TZ=UTC`, and a clean source copy without host dependencies, build output, caches, environment files, or previous test results. The candidate is based on commit `fac0664` plus this PP-010 change set; the final commit identifier is recorded in the Git handoff after the separately approved commit.

Commands reproduced locally:

```bash
pnpm install --frozen-lockfile
pnpm verify:repo
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm screenshots
pnpm audit --prod
pnpm verify:release:container
```

- Repository gate: whitespace, JSON/JSONC parsing, all relative Markdown/HTML links, four portable SVG sources, and a real Chromium render of the 1800×1050 interface-plan SVG passed.
- Root tests: 40 passed — 4 contracts, 4 design-token, 7 real Socket.IO server, 23 React/Vitest, and 2 deterministic fixture tests.
- Browser E2E: 2 passed. The core test used three isolated contexts and a production build against the real random-state server flow; the mobile test used keyboard submission and checked error semantics, dialogs, console/page errors, and horizontal overflow.
- Visual gate: 7 passed — six unchanged pixel baselines plus the portable SVG render, all in the PP-009 pinned environment.
- CI: `.github/workflows/ci.yml` performs one frozen root install on Node.js `22.22.0`, forces uncached Turbo tasks, runs the documented root gates, audits production dependencies, and retains only privacy-safe failed-browser diagnostics for seven days. Hosted workflow execution is not claimed by this local evidence.
- Cache evidence: `scripts/release-candidate-container.sh` runs the complete candidate twice in one isolated workspace, first with `turbo --force`, then with normal cache behavior. Both passes completed successfully.
