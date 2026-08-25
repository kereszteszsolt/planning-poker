# Planning Poker development guide

## Prerequisites

- Node.js `22.13+`
- Corepack (included with the supported Node.js release)
- Two browser profiles, private windows, or separate browsers for realistic multi-participant smoke tests

## Current repository map

```text
.
├── apps/
│   ├── web/                  React, Vite, Tailwind CSS, React Router, Socket.IO client
│   └── server/               Express, HTTP server, Socket.IO server, in-memory rooms
├── packages/
│   ├── contracts/            shared event types, room models, errors, and Zod schemas
│   └── config/               shared TypeScript and ESLint foundations
├── readme-assets/            Repository mark, legacy screenshot, support image
├── docs/                     User, architecture, design, testing, and release documentation
├── LICENSE                   Apache-2.0 license text
└── README.md                 Product and repository entry point
```

## Install and run

Install the single root lockfile, then start both applications through Turbo:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The frontend starts at `http://localhost:5173`; the backend listens at `http://localhost:3000`.

## Runtime configuration

The defaults below are safe for local development. Set backend variables in the shell that starts `pnpm dev`; Vite reads frontend values from the shell or `apps/web/.env`. The checked `apps/server/.env.example` and `apps/web/.env.example` files contain the same defaults.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PP_HOST` | `127.0.0.1` | Backend bind host |
| `PP_PORT` | `3000` | Backend HTTP/Socket.IO port |
| `PP_ALLOWED_ORIGINS` | local `localhost` and `127.0.0.1` port `5173` | Comma-separated browser origin allowlist; required and non-wildcard in production |
| `PP_MAX_PARTICIPANTS` | `20` | Maximum active participants per room |
| `PP_MAX_HTTP_BUFFER_BYTES` | `100000` | Socket.IO payload-size ceiling |
| `PP_ROOM_TTL_MS` | `3600000` | Inactivity lifetime before room closure |
| `PP_CLEANUP_INTERVAL_MS` | `60000` | Cleanup check interval |
| `PP_SESSION_TTL_MS` | `120000` | Disconnect fallback-token lifetime |
| `PP_RECOVERY_MAX_DISCONNECTION_MS` | `120000` | Socket.IO connection-state recovery window |
| `VITE_SOCKET_URL` | empty | Explicit browser Socket.IO endpoint; empty uses same origin |
| `VITE_SOCKET_PROXY_TARGET` | `http://127.0.0.1:3000` | Local Vite `/socket.io` WebSocket proxy target |
| `VITE_BASE_PATH` | `/` | Deployment base path used by Vite and copied room links |

Example production startup:

```bash
pnpm build

NODE_ENV=production \
PP_HOST=0.0.0.0 \
PP_PORT=3000 \
PP_ALLOWED_ORIGINS=https://poker.example.com \
pnpm --filter @planning-poker/server start

pnpm --filter @planning-poker/web start
```

The frontend preview listens on port `4173` by default; set the production allowlist to its real deployed origin rather than the local example.

Production startup fails when `PP_ALLOWED_ORIGINS` is missing or contains `*`. HTTPS/WSS termination remains the deployment reverse proxy's responsibility.

The Release 0.1 package fixed three legacy metadata defects before the workspace move:

- `dev-be` no longer contains an accidental trailing quote;
- `main` points to `./dist/index.js` instead of the misspelled `/dis/index.js`;
- TypeScript `module` is aligned to `NodeNext`, matching `moduleResolution` and the ESM package.

## Build and lint

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use Turbo filters for focused work, including dependency builds when required:

```bash
pnpm turbo run test --filter=@planning-poker/server
pnpm turbo run build --filter=@planning-poker/web
```

The root `screenshots` task is reserved in the task graph; deterministic generation remains part of [PP-009](releases/release-0.2-experience-foundation/stories/PP-009-privacy-safe-screenshot-workflow.md).

## Current code boundaries

### Frontend

- Keep route composition in `App.tsx`.
- Keep the singleton socket creation in `socket-client.ts`, injection/lifecycle in `SocketProvider`, typed event mapping in `transport/planning-poker-transport.ts`, and serializable data in the Zustand store.
- Keep state transitions pure and actions outside the stored data; components should use the narrow selectors in `state/planning-poker-store.ts` rather than subscribe to the whole store.
- Treat server `room-updated` payloads as canonical room state.
- Keep ephemeral form and disclosure state local unless it must coordinate across room components.
- Import room and event types from `@planning-poker/contracts`; do not add an application-local copy.

### Backend

- Every mutating event must verify room existence, participant membership, authorization, and payload validity.
- Broadcast only after the state transition succeeds.
- Keep room cleanup and moderator handoff rules explicit and testable.
- Keep room lookup in `Map`, validate UUID/name/payload data before lookup or mutation, and return the shared acknowledgement envelope for every event.
- Keep persistence, authentication, and horizontal scaling out of scope unless a release explicitly introduces them.

## Turborepo layout

PP-005 establishes the following current layout:

```text
.
├── apps/
│   ├── web/                   @planning-poker/web
│   └── server/                @planning-poker/server
├── packages/
│   ├── contracts/             event payloads, acknowledgements, schemas, room types
│   └── config/                shared TypeScript and lint configuration
├── package.json               root scripts and package-manager identity
├── pnpm-lock.yaml             one workspace lockfile
├── pnpm-workspace.yaml        workspace membership and install policy
└── turbo.json                 task graph, inputs, outputs, and cache policy
```

`apps/*` depend on `packages/contracts` through `workspace:*`; the contract package depends only on the shared configuration package. Application-specific Vite, Socket.IO, and runtime settings remain inside their applications, preventing circular dependencies.

Corepack selects the exact pnpm version from the root `packageManager` field. The workspace permits only the required `esbuild` dependency build script, and pnpm's default release-age policy remains active. Do not use npm or generate a `package-lock.json` in this repository.

Turbo caches reproducible builds and checks locally in `.turbo`, which is ignored. Remote caching is optional. Runtime and Vite variables that affect tasks are declared in `turbo.json`; development is persistent and uncached so `Ctrl+C` stops both application processes through the root task runner.

## Zustand boundary

The implemented store contains serializable state only. A separate controller dispatches pure transitions, and the transport owns all Socket.IO and session-storage effects:

```text
PlanningPokerState
├── connectionSlice           connection/recovery status
├── sessionSlice              room ID, participant identity, display name, short-lived token
├── roomSlice                 canonical room snapshot and derived selectors
└── uiSlice                   normalized public error and forced-exit reason

socketTransport
├── connect / disconnect
├── subscribe / unsubscribe
├── typed emit with acknowledgement
└── dispatch normalized events into store actions
```

Local input values, temporary menus, clipboard feedback, and one-component dialog state remain in React state. No Zustand persistence or Redux DevTools middleware is enabled. The reconnect identity uses existing tab-scoped `sessionStorage`; no room snapshot, vote, participant list, token, or display name is written to `localStorage`. No user preference is currently persisted, so a future allowed preference needs a separately versioned key and privacy review.

## Design and screenshot workflow

1. Update the approved token contract in `packages/design-tokens/tokens/planning-poker.tokens.json`.
2. Import or synchronize the same DTCG token source in Penpot.
3. Update reusable Penpot components and responsive boards.
4. Implement the reviewed UI behavior using semantic tokens rather than arbitrary colors.

Run `pnpm --filter @planning-poker/design-tokens build` after changing the JSON
source and commit the regenerated `dist/tokens.css`. The package `check` task
rejects generated drift, while its tests reject invalid values, aliases,
duplicate paths, missing references, and essential color pairs below WCAG AA.
5. Run unit, integration, accessibility, and Playwright smoke tests.
6. Regenerate privacy-safe screenshots in the pinned capture environment.
7. Review image diffs and commit intentional changes with the design export.

See [design-system plan](design-system.md), [Penpot handoff](design/README.md), and [screenshot policy](screenshots/README.md).

## Release workflow

- Every release has a README with goal, scope, dependencies, exit criteria, and story links.
- Every story includes status, user story, acceptance criteria, out-of-scope boundaries, implementation notes, and verification evidence.
- Planned checkboxes remain unchecked until supported by source and test evidence.
- Documentation must not describe planned behavior as current.
- Run whitespace and link checks before packaging.
- Update `CHANGELOG.md`, badges, release index, and documentation links together.
