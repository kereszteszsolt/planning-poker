# Planning Poker verification

## PP-005 workspace verification

PP-005 was verified on 2026-08-24 in `node:22.22.0-bookworm-slim` with npm `10.9.4` and Turborepo `2.10.11`. The clean-install gate ran from a separate `/tmp` copy that excluded `.git`, `.env`, `node_modules`, `dist`, `.turbo`, and `.vite` content.

### Root quality gate

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run screenshots
npm audit --omit=dev
```

| Check | Result |
| --- | --- |
| Clean root install | One root lockfile installed 373 packages; no nested lockfiles were present |
| Lint | Contracts, server, and web tasks passed |
| Typecheck | Contracts build/typecheck plus server and web typechecks passed |
| Contract tests | 4 passed: normalization, malformed payload rejection, forward-compatible metadata filtering, and supported value sets |
| Server integration tests | 5 passed with the PP-004 room, validation, moderation, reconnect, and cleanup matrix unchanged |
| Web tests | 3 files and 5 tests passed |
| Production builds | Contracts, server, and web builds passed; the repeated root build was 3/3 cache hits |
| Screenshot task | Root task and declared build dependencies passed; capture generation remains reserved for PP-009 |
| Production dependency audit | 0 vulnerabilities reported |

The final gate used ESLint `10.9.1`, retained all 14 passing tests, and reported 0 vulnerabilities.

### Focused and runtime checks

The documented filters were exercised successfully:

```bash
npm run test -- --filter=@planning-poker/server
npm run build -- --filter=@planning-poker/web
```

The filtered server test included the contracts and server builds, then passed all five server tests. The filtered web build included the contracts dependency and completed from cache.

`npm run dev` built the contracts package, started Vite on `http://localhost:5173` and the server on `http://127.0.0.1:3000`, then reported `Shutting down Turborepo tasks...` when the time-limited harness sent `SIGINT`.

After a clean root build, both generated applications were started from package output. Local HTTP probes returned:

```json
[
  { "status": 200, "body": { "service": "planning-poker", "status": "ok" } },
  { "status": 200, "html": true }
]
```

The package graph contained only the intended direction: both apps depend on `@planning-poker/contracts` and `@planning-poker/config`; contracts depend on config; config has no dependency on an app or contracts.

## Remaining release checks

PP-005 preserves the PP-004 automated behavior matrix and does not change the documented ports, UI layout, or Socket.IO event names. A fresh interactive multi-browser run was not repeated for this directory-only boundary change. Deterministic browser, accessibility, and screenshot evidence remains scoped to PP-009 and PP-010.
