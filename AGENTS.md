# Planning Poker Codex engineering guide

Planning Poker is a **React / TypeScript / Vite + Express / Socket.IO** application in a pnpm/Turborepo monorepo. The server stores live rooms and recovery state **in memory**, not in a database. `packages/contracts` provides typed events and runtime schemas; `packages/design-tokens` owns shared visual tokens.

## Progressive context loading

1. Read this file and **one active `PP-*` story or requested maintenance task**; check its release README only for dependencies/status.
2. Inspect the changed package/module and focused tests. Consult `docs/architecture.md`, `docs/testing.md`, `docs/design-system.md`, `docs/screenshots/README.md` only for affected boundaries.
3. Load one relevant technology skill below. Do not load every story, agent, skill, or design artifact upfront.

## Technical boundaries

- **Shared contracts:** `packages/contracts` defines event names, payloads, acknowledgements, limits, public errors and Zod validation. Change one canonical definition and update the server, transport, store and affected tests together; validate untrusted payloads at the server boundary.
- **Express / Socket.IO:** server owns authoritative state and authorization. Never trust a client-supplied participant ID for mutations. Preserve stable acknowledgement shape, canonical snapshots, per-session token privacy and cleanup of both application and Socket.IO membership.
- **React / Zustand:** the transport adapter owns socket creation/listeners and browser session-token access; Zustand stores serializable snapshots and transient session state. UI components render derived state and dispatch typed actions. Clean up listeners on reconnect/unmount.
- **UI and design:** use canonical DTCG tokens and generated CSS, preserve accessible focus/keyboard/loading/error states and responsive behavior. Treat Penpot as optional design reference, not runtime state or mandatory tooling.
- **Visual tests:** `apps/screenshots` runs Playwright with deterministic fixtures and real built UI. Never use a live room, private data or personal browser profile for screenshots; baseline replacement needs review/approval.
- Preserve the current account-free, short-lived in-memory architecture. No new database, analytics, cloud service or cross-process synchronization as incidental refactoring.

## Skills — use only when relevant

| Skill | Technical trigger |
| --- | --- |
| `full-stack-delivery` | React/Express/Turborepo integration, package/dependency/build changes |
| `contracts-and-state` | Shared event schemas, Socket.IO transport, Zustand synchronization |
| `realtime-room-lifecycle` | Socket.IO server authorization, recoverability, expiry and cleanup |
| `design-handoff` | Penpot, DTCG tokens, UI/accessibility and responsive styling |
| `screenshot-evidence` | Playwright E2E, deterministic UI fixtures and visual baseline review |
| `release-evidence` | Verification, story status, CI parity and release documentation |

## Optional roles and approvals

The main Codex session should normally implement the approved scope itself. `architect` is optional read-only planning for risky cross-package changes; `reviewer` is optional read-only risk/diff review; `implementation_worker` is the **sole writer** when delegated. No default architect → worker → reviewer pipeline, no overlapping edits and no parallel test duplication. Two active threads maximum; one writer.

- Follow `docs/story-workflow.md` or the active story's approval gates. Plan approval, implementation approval, commit approval and push/next-story approval remain **separate**.
- Run focused checks first (package-native `pnpm --filter ...`), then `pnpm verify:repo` and broader lint/typecheck/test/build/E2E checks when scope demands them. `docs/testing.md` defines approved release gates.
- Record actual results and skipped checks; do not invent screenshots, source privacy guarantees, hosting, test counts or CI success.
- Review the diff, propose one commit, request approval before commit/push and do not start the next story automatically.

## Source comments

Comments explain non-obvious **reasons**, not every line or acceptance criterion. Preserve existing SPDX/third-party notices and the repository's source-comment rules; don't add irrelevant headers or duplicate change histories to code.
