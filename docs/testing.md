# Planning Poker testing and verification

## Current automated baseline

PP-010 consolidates the earlier story tests into one root gate. The current suite has 40 unit/integration tests, 2 real-stack Playwright tests, 6 pixel baselines, and 1 portable SVG browser-render check.

| Package/gate                       | Coverage                                                                               | Current count |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ------------: |
| `@planning-poker/contracts`        | Runtime schemas, normalization, metadata filtering, value sets                         |             4 |
| `@planning-poker/design-tokens`    | Generation drift, references, values, duplicate paths, contrast                        |             4 |
| `@planning-poker/server`           | Random-port real Socket.IO clients, full lifecycle, validation, authorization, cleanup |             7 |
| `@planning-poker/web`              | Routes, composition, Zustand, transport, Strict Mode, recovery, accessibility          |            23 |
| `@planning-poker/screenshots` unit | Deterministic privacy-safe fixture isolation                                           |             2 |
| Playwright E2E                     | Three-context desktop/mobile real-server flow and keyboard/error smoke                 |             2 |
| Playwright visual/SVG              | Six reviewed images plus portable SVG render                                           |             7 |

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm screenshots
pnpm verify:repo
```

Use `pnpm verify` for the complete local sequence. Use `pnpm verify:release:container` for an isolated frozen install followed by a forced no-cache pass and a normal-cache pass in exact Playwright image `1.62.1-noble`.

### Focused package checks

```bash
pnpm turbo run test --filter=@planning-poker/server
pnpm turbo run test --filter=@planning-poker/web
pnpm turbo run test --filter=@planning-poker/contracts
pnpm --filter @planning-poker/screenshots e2e
```

### Combined development smoke

```bash
pnpm dev
```

Open `http://localhost:5173` in at least three isolated browser contexts.

## Manual smoke matrix

| ID | Scenario | Expected result |
| --- | --- | --- |
| SM-01 | Load home with backend running | Home actions are available and no connecting card remains |
| SM-02 | Create room and join as first user | A room opens and the first participant is moderator |
| SM-03 | Join from a second browser | Both clients receive the same participant list |
| SM-04 | Attempt duplicate display name | Join is rejected with a readable error |
| SM-05 | Vote from one participant | Others see voted status but not the value before reveal |
| SM-06 | Revoke vote | Vote is removed and any revealed result is hidden |
| SM-07 | All participants vote | Room reveals automatically and both clients agree |
| SM-08 | Moderator reveals early | Submitted values show; non-voters remain identified |
| SM-09 | Reset votes | Every vote clears and cards are enabled again |
| SM-10 | Change each value set | Correct cards appear and previous votes clear |
| SM-11 | Numeric result | Average, minimum, maximum or consensus, and distribution are correct |
| SM-12 | Mixed numeric and special cards | Distribution includes all cards; numeric calculation excludes special cards |
| SM-13 | Delegate moderation | Old moderator loses controls; new moderator gains them |
| SM-14 | Moderator disconnects | The longest-present eligible participant becomes the sole moderator |
| SM-15 | Reconnect moderator identity | A recoverable session returns with the same participant ID and a fresh canonical snapshot without duplicating the name |
| SM-16 | Kick participant | Removed client sees the kicked message and no longer affects room state |
| SM-17 | Copy room ID and link | Clipboard receives the intended value or an actionable failure is shown |
| SM-18 | Narrow viewport | Home, join, room controls, cards, and participants remain usable without horizontal page overflow |
| SM-19 | Backend interruption and restart | UI reports connection loss; recovery behavior matches documented limitations |
| SM-20 | One-hour inactivity cleanup in accelerated test | Clients receive room closure and the room cannot be mutated afterwards |

The server suite automates SM-02 through SM-16 and SM-20 at the protocol/state boundary. Playwright automates a representative three-context create/join/vote/reveal/reset/delegate/kick/recovery flow plus mobile keyboard/error behavior. The remaining matrix is useful for exploratory review, not a substitute for the automated gate.

## Release 0.2 automation

```mermaid
flowchart LR
    UNIT[Frontend unit tests\nVitest + Testing Library] --> TURBO[turbo test]
    SERVER[Server unit and integration tests\nSocket.IO client against ephemeral server] --> TURBO
    E2E[Playwright multi-user smoke] --> TURBO
    VISUAL[Deterministic screenshot checks] --> TURBO
    TYPE[Shared-contract typecheck] --> TURBO
    TURBO --> CI[GitHub Actions]
```

### Implemented automated coverage

- Room creation, join validation, duplicate names, vote/revoke/reveal/reset, value-set change, delegation, removal, leave, disconnect, moderator handoff, and inactivity cleanup.
- Unauthorized moderation attempts and malformed payloads.
- Recoverable and unrecoverable Socket.IO reconnect paths.
- Zustand store actions, selectors, reset behavior, and transport subscription cleanup.
- Responsive home, join, room, result, disconnected, kicked, and closed states.
- Keyboard operation, accessible names, focus visibility, live status announcements, and reduced-motion behavior.
- Turborepo cache inputs/outputs and clean workspace installation.

## Screenshot determinism

Playwright visual output can vary across operating systems, browser versions, fonts, and rendering settings. PP-009 pins Playwright and its container to `1.62.1`, fixes locale, timezone, viewport, color scheme, clock/randomness, animations, fonts readiness, network boundary, and invented fixture data, then compares the real built React UI with the six committed gallery images.

Run `pnpm screenshots:container` for comparison and `pnpm screenshots:update:container` only after explicitly deciding to replace reviewed baselines. On failure, compare the expected PNG in `docs/screenshots/` with Playwright's `*-actual.png` and `*-diff.png` under `apps/screenshots/test-results/`. Inspect all three before changing the expected image; test output is ignored and must not be committed.

See [PP-009](releases/release-0.2-experience-foundation/stories/PP-009-privacy-safe-screenshot-workflow.md) and the [screenshot gallery](screenshots/README.md).

## Troubleshooting

- If host Node.js is unavailable or `node_modules` was created for another platform, use `pnpm verify:release:container`; it copies only source into a clean Linux workspace.
- If a visual comparison fails, inspect the expected, actual, and diff PNGs under `apps/screenshots/test-results/`. Never update baselines before reviewing the semantic state and pixel diff.
- If E2E fails, inspect `apps/screenshots/e2e-results/` and `apps/screenshots/e2e-report/`. Traces, screenshots, and videos contain invented test identities only and are ignored by Git.
- If Turbo appears to reuse stale output, run `pnpm turbo run lint typecheck test build --force`; the release-container script always performs this pass first.
- `pnpm verify:repo` reports broken local documentation links, invalid JSON/JSONC, non-portable SVG sources, and whitespace errors when Git metadata is available.

The checks completed for this documentation package and the registry limitation are recorded in the [package verification report](verification.md).

## Evidence template

When a story is implemented, record:

```text
Environment:
- OS/container:
- Node.js/npm:
- Browser/Playwright:

Commands:
- pnpm install --frozen-lockfile
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- pnpm screenshots

Results:
- lint:
- typecheck:
- unit/integration:
- end-to-end:
- build:
- screenshots reviewed:
- git diff --check:
```
