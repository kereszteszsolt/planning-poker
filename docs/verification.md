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

### Remaining manual evidence

The interactive multi-browser convergence criterion remains unchecked. No Playwright dependency or temporary browser harness was added ahead of PP-009/PP-010, and no claim is made for vote, reveal, reset, delegation, reconnect, and kick convergence in real browser contexts during this verification run.

## Remaining release checks

PP-005 preserves the PP-004 automated behavior matrix and does not change the documented ports, UI layout, or Socket.IO event names. A fresh interactive multi-browser run was not repeated for this directory-only boundary change. Deterministic browser, accessibility, and screenshot evidence remains scoped to PP-009 and PP-010.
