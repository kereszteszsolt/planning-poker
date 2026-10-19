# Planning Poker verification

## PP-005 workspace verification

PP-005 was re-verified on 2026-08-25 in `node:22.22.0-bookworm-slim` with Corepack, pnpm `11.23.0`, and Turborepo `2.10.11`. The final clean gate copied the read-only source into an ephemeral container workspace while excluding `.git`, `.env`, `node_modules`, `dist`, `.turbo`, `.vite`, and `.pnpm-store`, so it could not reuse host dependencies or Turbo cache.

### Root quality gate

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm ignored-builds
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm screenshots
pnpm audit --prod
```

| Check | Result |
| --- | --- |
| Clean root install | The root `pnpm-lock.yaml` installed 363 packages across all five workspace projects and passed pnpm's supply-chain policy check for 438 lockfile entries |
| Dependency builds | The explicitly permitted `esbuild` postinstall passed; `pnpm ignored-builds` reported no automatically ignored builds |
| Lint | Contracts, server, and web tasks passed |
| Typecheck | Contracts build/typecheck plus server and web typechecks passed |
| Contract tests | 4 passed: normalization, malformed payload rejection, forward-compatible metadata filtering, and supported value sets |
| Server integration tests | 5 passed with the PP-004 room, validation, moderation, reconnect, and cleanup matrix unchanged |
| Web tests | 3 files and 5 tests passed |
| Production builds | Contracts, server, and web builds passed; the repeated root build was 3/3 cache hits |
| Screenshot task | Root task and declared build dependencies passed; capture generation remains reserved for PP-009 |
| Production dependency audit | No known vulnerabilities reported |

The pnpm supplement retained all 14 passing tests and the original quality-gate behavior. A repeated root build completed with 3/3 Turbo cache hits.

### Focused and runtime checks

The documented filters were exercised successfully:

```bash
pnpm turbo run test --filter=@planning-poker/server
pnpm turbo run build --filter=@planning-poker/web
```

The filtered server test included the contracts and server builds, then passed all five server tests. The filtered web build included the contracts dependency and completed from cache.

`pnpm dev` built the contracts package, started Vite on `http://localhost:5173` and the server on `http://127.0.0.1:3000`, then reported `Shutting down Turborepo tasks...` when the time-limited harness sent `SIGINT`.

After a clean root build, both generated applications were started from package output. Local HTTP probes returned:

```json
[
  { "status": 200, "body": { "service": "planning-poker", "status": "ok" } },
  { "status": 200, "html": true }
]
```

The package graph contained only the intended direction: both apps depend on `@planning-poker/contracts` and `@planning-poker/config`; contracts depend on config; config has no dependency on an app or contracts.

The initial npm-based PP-005 verification from 2026-08-24 was superseded by this pnpm supplement. `package-lock.json` is no longer part of the supported installation path.

## PP-006 Zustand state-boundary verification

PP-006 was verified on 2026-08-25 in a fresh `node:22.22.0-bookworm-slim` workspace copied from a read-only source mount. The copy excluded host dependencies, build output, environment files, local stores, and Turbo caches.

### Automated state and transport evidence

The clean root gate passed with pnpm `11.23.0` and Turborepo `2.10.11`:

| Check | Result |
| --- | --- |
| Frozen install | 364 packages across five workspace projects; 439 lockfile entries passed pnpm's supply-chain policies; no build scripts were automatically ignored |
| Lint | Contracts, server, and web tasks passed without cache |
| Typecheck | Four tasks passed without cache |
| Contract tests | 4 passed |
| Server integration tests | 5 passed |
| Web tests | 5 files and 12 tests passed |
| Total tests | 21 passed |
| Build | Contracts, server, and web production builds passed |
| Screenshot task | The reserved root task and its build dependencies passed; deterministic capture remains PP-009 scope |
| Production audit | No known vulnerabilities reported |

The web suite proves pure store transitions, every exported selector, stale/wrong-room transition rejection, leave/return-home/forced-exit/session-loss resets, no `localStorage` writes, listener registration and cleanup, acknowledgement normalization, one resume per connection generation, Strict Mode socket ownership, route recovery, and selector render isolation. A source search confirmed that application components do not import or call the Socket.IO client; only `socket-client`, socket types, the provider, and the injected transport boundary do so.

### Runtime evidence

`pnpm dev` rebuilt contracts, started Vite at `http://localhost:5173` and the server at `http://127.0.0.1:3000`, then shut down its Turbo tasks when the time-limited harness sent `SIGINT`.

Fresh production output was also started for both packages. Local probes returned HTTP 200 with the expected backend health body and frontend application root:

```json
[
  { "status": 200, "body": { "service": "planning-poker", "status": "ok" } },
  { "status": 200, "appRoot": true }
]
```

### PP-006 evidence boundary

The earlier PP-006-only run did not claim interactive multi-browser evidence. PP-010 now supplies that separate real-stack browser evidence below.

## PP-009 deterministic screenshot verification

PP-009 was verified on 2026-08-25 in `mcr.microsoft.com/playwright:v1.62.1-noble`, matched to exact `@playwright/test` `1.62.1`. The repository was copied read-only into an ephemeral workspace excluding `.git`, `.env`, host dependencies, build output, caches, and prior browser results. Corepack activated pnpm `11.23.0`; the frozen install passed supply-chain policy verification for 444 lockfile entries.

### Clean root quality gate

| Check | Result |
| --- | --- |
| New-source formatting | Prettier check passed for the screenshot package and root JSON task definitions |
| Lint | 5 tasks passed, including screenshot fixture/config syntax checks |
| Typecheck | 8 tasks passed, including all application and shared-package dependency builds |
| Root tests | 31 passed: 4 contracts, 4 design-token, 5 server, 16 web, and 2 deterministic screenshot-fixture tests |
| Production build | Contracts, design tokens, server, and web passed |
| Visual comparison | 6/6 Playwright full-page comparisons passed with zero differing pixels |
| Browser environment | Chromium supplied by the pinned Playwright `1.62.1` Noble image, UTC, `en-US`, light scheme, reduced motion |

The root update and comparison paths were both exercised. `pnpm screenshots:update` created exactly the six documented gallery files in the ephemeral workspace; only those files were copied back. A subsequent normal `pnpm screenshots` run compared the real built React UI against all six baselines without rewriting them.

Every PNG was decoded and visually inspected at original resolution for clipping, horizontal overflow, focus, state meaning, stale UI, and sensitive data. A source and link search confirmed that the README/gallery use the new deterministic voting image before the duplicate legacy `Capture1.png` and `planning-poker-room-desktop.png` files were removed.

## PP-010 test and CI verification

PP-010 was locally verified in `mcr.microsoft.com/playwright:v1.62.1-noble` with exact `@playwright/test` `1.62.1`, Corepack, pnpm `11.23.0`, Chromium, UTC, and a source-only workspace without host dependencies, environment files, build output, caches, or previous results.

| Check            | Result                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frozen install   | 444 lockfile entries passed pnpm supply-chain policy verification                                                                                                        |
| Repository gate  | Relative Markdown/HTML links, JSON/JSONC, four portable SVG sources, and whitespace passed; Chromium rendered the 1800×1050 interface-plan SVG without external requests |
| Lint             | 5 package tasks passed                                                                                                                                                   |
| Typecheck        | 9 build/typecheck tasks passed                                                                                                                                           |
| Unit/integration | 40 passed: 4 contracts, 4 design-token, 7 server, 23 web, 2 fixture                                                                                                      |
| Production build | Contracts, design tokens, server, and web passed                                                                                                                         |
| Real-stack E2E   | 2 passed: three isolated users through the core room lifecycle, plus mobile keyboard/error/overflow smoke                                                                |
| Visual/SVG       | 7 passed: six zero-diff baseline comparisons and one portable SVG render                                                                                                 |
| Browser errors   | No console errors or uncaught page errors; no blocking native dialogs or horizontal overflow                                                                             |
| Cache behavior   | Full source-only candidate passed once with forced task execution and once with normal Turbo caching                                                                     |

The checked-in GitHub Actions workflow uses Node.js `22.22.0`, Corepack, exact pnpm `11.23.0`, one frozen root install, the documented root commands, forced uncached Turbo execution, production dependency audit, protected manual/main/tag concurrency behavior, and seven-day privacy-safe failure artifacts. No hosted workflow result is claimed in this local report.

## 2026-10-19 — About, attribution and functional consumer names

The maintainer approved this change for ClearField, CrownGrid, PointFlip and TypeNudge. The repository-root `brand/` remains the editable JSON/artwork input. Consumers use app-info, About, link-icon and author-attribution names; configuration guides use `app-configuration.md`. Source catalogs, artwork, legal licenses and stable storage/package IDs were compared with the task-start SHA-256 snapshot and preserved. Pre-existing unrelated pending work remains intact. No commit or push was requested.

The native About dialog displays configured identity/description, local poster when configured, author/project links, coffee/support actions and the voluntary-support notice. Tooltips expose the full destination and ordered `hu | en | ro | de` language list, fit narrow screens and keep a stable accessible name. Copyright uses the current year and configured author; the application determines its legal license independently. Footer attribution keeps the website on a separate line. Support actions remain in About. Existing detailed About routes remain accessible in CrownGrid/PointFlip. Current game/editor/room state is preserved when opening the modal.

There is no application Docker stack in these four repositories. PointFlip's existing one-shot validation containers publish no host ports and now explicitly use `--restart=no`. The policy in each `AGENTS.md` requires future published host ports to bind only to `127.0.0.1`, above 33000, with the next available multiple-of-ten allocation, and manual-only restart behavior. Temporary browser previews used only loopback 33110/33120/33130 with restart policy `no`; they were stopped after verification. Existing AI-app services were not redeployed.

`pnpm --filter @planning-poker/web... build` built contracts/design tokens before the web app; a first direct web typecheck on the fresh install lacked those dependency outputs. Final web build, ESLint, 23 web tests and `pnpm verify:repo` passed. The repository verifier used its Git-unavailable fallback; the separate Python audit checked the actual HEAD/index, scoped Git whitespace, catalog/artwork hashes, functional filenames and Markdown links. The two existing real-stack `core-flow.spec.mjs` tests passed in the existing Playwright 1.62.1 image with `--network none`, including multi-participant voting/recovery and mobile keyboard flow.

Three additional Chromium contexts (1440/390/320px) checked the actual built popup/footer, source-selected icon/poster, Apache-2.0 attribution, two-line desktop website description/URL tooltip and responsive wrapping, close/Escape/backdrop behavior, focus restoration, and preserved home input. A separate real synthetic room retained its participant, URL and confirmed vote across About opening/closing, and successfully revealed that vote afterward. Supplemental harness corrections awaited the asynchronous vote acknowledgement and targeted the participant row rather than the duplicate name caption; no room/store/server behavior was modified. Product labels consume the existing PointFlip catalog while stable `@planning-poker/*` technical identities remain. Existing gallery helper headings now consume the same catalog; approved screenshot baselines were not replaced and pixel comparisons were not claimed. Captures/logs are under `/tmp/four-app-about/`; no public deployment was performed.


## 2026-10-19 — Commit validation and local startup repair

The maintainer requested a local commit of the staged PointFlip identity, About and attribution changes. Unstaged Codex guidance/configuration remains outside this commit. The accidental npm `package-lock.json` is excluded: the canonical dependency lock remains `pnpm-lock.yaml`.

Local Windows startup initially failed because the existing dependency tree mixed incompatible filesystem links and lacked the root Turbo executable shim. Recreating only the ignored dependency directories with Windows Node.js `24.18.0` and `pnpm install --frozen-lockfile` restored `pnpm dev`; no package manifest or pnpm lockfile changed. The frontend responded on `http://localhost:5173`, and isolated Chrome contexts completed create/join/vote/reveal with two invented participants.

Pre-commit validation used Windows Node.js `24.18.0`, Corepack and the pinned pnpm `11.23.0`. `pnpm turbo run lint typecheck test build` passed all 19 tasks (four dependency/application builds reused the local cache). All 40 unit/integration tests passed: contracts 4, design tokens 4, server 7, web 23 and screenshot fixtures 2. Both existing `core-flow.spec.mjs` tests then passed against their isolated real-stack test server using installed Chrome through a temporary Playwright configuration; video recording was disabled because the pinned Playwright browser installation was unavailable on this host. This is functional browser evidence, not pinned-container visual evidence.

The repository verifier passed its source checks using the documented Git-unavailable fallback; separate CRLF-aware Git whitespace checks passed. A staged credential-pattern scan found no matching signatures. Screenshot pixel comparisons and the two-pass release container were not run, and reviewed image baselines were not replaced. No push or hosted CI/deployment result is claimed.
