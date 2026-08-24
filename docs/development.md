# Planning Poker development guide

## Prerequisites

- Node.js `20.19+` or `22.12+`
- npm
- Two browser profiles, private windows, or separate browsers for realistic multi-participant smoke tests

## Current repository map

```text
.
├── planning-poker-fe/        React, Vite, Tailwind CSS, React Router, Socket.IO client
├── planning-poker-be/        Express, HTTP server, Socket.IO server, in-memory rooms
├── readme-assets/            Repository mark, legacy screenshot, support image
├── docs/                     User, architecture, design, testing, and release documentation
├── LICENSE                   Apache-2.0 license text
└── README.md                 Product and repository entry point
```

## Install and run

Install both lockfiles before using the combined development command:

```bash
cd planning-poker-fe
npm ci

cd ../planning-poker-be
npm ci
npm run dev-concurrently
```

The frontend starts at `http://localhost:5173`; the backend listens at `http://localhost:3000`.

## Runtime configuration

The defaults below are safe for local development. Set backend variables in the shell that starts `npm run dev-be`; Vite reads frontend values from the shell or `planning-poker-fe/.env`. The checked `.env.example` files contain the same defaults.

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
NODE_ENV=production \
PP_HOST=0.0.0.0 \
PP_PORT=3000 \
PP_ALLOWED_ORIGINS=https://poker.example.com \
npm run build && npm start
```

Production startup fails when `PP_ALLOWED_ORIGINS` is missing or contains `*`. HTTPS/WSS termination remains the deployment reverse proxy's responsibility.

The Release 0.1 package fixed three metadata defects:

- `dev-be` no longer contains an accidental trailing quote;
- `main` points to `./dist/index.js` instead of the misspelled `/dis/index.js`;
- TypeScript `module` is aligned to `NodeNext`, matching `moduleResolution` and the ESM package.

## Build and lint

```bash
cd planning-poker-fe
npm run lint
npm test
npm run build

cd ../planning-poker-be
npm test
```

The repository currently has separate lockfiles and no root task runner. Do not claim a one-command root build until [PP-005](releases/release-0.2-experience-foundation/stories/PP-005-turborepo-workspace-and-shared-contracts.md) is implemented.

## Current code boundaries

### Frontend

- Keep route composition in `App.tsx`.
- Keep the singleton transport in `socket-client.ts`, connection lifecycle in `SocketProvider`, and serializable context values in `socket-context.ts`.
- Treat server `room-updated` payloads as canonical room state.
- Keep ephemeral form and disclosure state local unless it must coordinate across room components.
- Do not add a second copy of room or event types when the shared-contract package is introduced.

### Backend

- Every mutating event must verify room existence, participant membership, authorization, and payload validity.
- Broadcast only after the state transition succeeds.
- Keep room cleanup and moderator handoff rules explicit and testable.
- Keep room lookup in `Map`, validate UUID/name/payload data before lookup or mutation, and return the shared acknowledgement envelope for every event.
- Keep persistence, authentication, and horizontal scaling out of scope unless a release explicitly introduces them.

## Planned Turborepo layout

Release 0.2 proposes the following migration:

```text
.
├── apps/
│   ├── web/                   current planning-poker-fe
│   └── server/                current planning-poker-be
├── packages/
│   ├── contracts/             event payloads, acknowledgements, schemas, room types
│   ├── design-tokens/         DTCG source and generated CSS variables
│   └── config/                shared TypeScript and lint configuration
├── package.json               root scripts and workspaces
├── package-lock.json          one workspace lockfile
└── turbo.json                 task graph, inputs, outputs, and cache policy
```

Migration is complete only when clean-install, development, lint, typecheck, test, build, and screenshot commands run from the repository root and the old duplicate lockfiles are removed in the same reviewed change.

## Planned Zustand boundary

The store should contain serializable state and actions, not a persisted Socket.IO object:

```text
usePlanningPokerStore
├── connectionSlice           status, last error, recovery state
├── sessionSlice              room ID, participant identity, display name
├── roomSlice                 canonical room snapshot and derived selectors
└── uiSlice                   non-sensitive cross-component UI state only

socketTransport
├── connect / disconnect
├── subscribe / unsubscribe
├── typed emit with acknowledgement
└── dispatch normalized events into store actions
```

Local input values, temporary menus, and one-component dialog state should remain in React state. Room state must not be persisted to `localStorage` by default.

## Design and screenshot workflow

1. Update the token contract in `packages/design-tokens` after Release 0.2 creates it.
2. Import or synchronize the same DTCG token source in Penpot.
3. Update reusable Penpot components and responsive boards.
4. Implement the reviewed UI behavior using semantic tokens rather than arbitrary colors.
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
