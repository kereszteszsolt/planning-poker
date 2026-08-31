# AGENTS.md

## Project

**Planning Poker** is a real-time team-estimation application built as a pnpm and Turborepo monorepo. The browser uses React, Vite, Tailwind CSS, Zustand, and Socket.IO Client. The server uses Express, Socket.IO, TypeScript, and in-memory room and recovery-session maps.

The core flow is small: create a room, share its link, join with a display name, vote privately, reveal the result, discuss, and reset. The current application has no account system, database, analytics SDK, or durable room history.

## Source of truth

Read the smallest relevant set before changing code:

- the active `PP-*` story and its release `README.md` for scope and acceptance criteria;
- `docs/architecture.md` for runtime, event, state, and dependency boundaries;
- `docs/development.md` for local commands and configuration;
- `docs/testing.md` for focused and release verification;
- `docs/design-system.md` and `docs/design/README.md` for tokens and Penpot handoff;
- `docs/screenshots/README.md` for deterministic visual evidence;
- `docs/privacy-and-contact.md` for data, transport, screenshot, and public-contact limits;
- `docs/brand-configuration.md` for product identity and terminology.

Implemented behavior, tests, and checked evidence outrank a stale prose claim. Do not describe planned authentication, persistence, hosting, or security behavior as implemented.

## Product principles

- Keep room creation and joining account-free and easy to understand.
- Keep the server authoritative for membership, votes, moderation, reveal state, and cleanup.
- Keep submitted vote values private until reveal; expose only voted status beforehand.
- Treat a room URL as a bearer-style access link and avoid sensitive data in display names.
- Preserve deterministic moderator handoff and at most one moderator per snapshot.
- Make connection loss, expired rooms, replaced sessions, kicks, and recovery visible to the user.
- Keep the current in-memory limitation explicit; never imply durable storage.
- Do not add tracking, analytics, persistence, or a new external service without an approved story.

## Repository architecture

```text
apps/web                  React and Vite client
apps/server               Express and Socket.IO server
apps/screenshots          Playwright E2E and visual-evidence harness
packages/contracts        shared events, schemas, acknowledgements, and room types
packages/design-tokens    canonical DTCG token source and generated CSS
packages/config           shared TypeScript and ESLint configuration
docs                      product, architecture, design, release, and evidence records
scripts                   repository and container verification entry points
```

Use pnpm for dependency management and Turborepo for root orchestration. Keep package-native scripts usable and do not bypass workspace boundaries with copied source or relative imports between packages.

## Shared contract rules

`@planning-poker/contracts` is the shared source for public room types, event payloads, acknowledgements, errors, value sets, limits, and runtime validation schemas.

- Change a shared event or public model once in the contracts package.
- Update server, transport, store, tests, and documentation together when semantics change.
- Validate every client payload at the server boundary even when TypeScript already accepts it.
- Preserve the acknowledgement shape: success returns data; failure returns a public code, message, and recovery meaning.
- Never expose socket IDs, recovery tokens, internal join order, or other server-only fields in a room snapshot.
- Do not introduce a second hand-written copy of an existing event or room type.

## Server and room lifecycle

Keep `createPlanningPokerServer` testable through injected configuration, clock, and HTTP server boundaries.

- Use `Map` for untrusted room, participant, and session keys.
- Authorize mutations from the socket's current server-side membership, never from a claimed participant ID.
- Validate UUIDs, display names, event payloads, vote values, participant limits, and moderator-only actions.
- Broadcast a fresh canonical snapshot only after a successful mutation.
- Keep session tokens private to their participant and short-lived.
- Remove Socket.IO room membership together with application membership on leave, kick, disconnect, replacement, or room closure.
- Delete empty or expired rooms and their associated recovery sessions.
- Preserve automatic reveal, vote revocation, reset, value-set changes, moderator delegation, and deterministic handoff behavior.
- Keep production origin configuration explicit; production must not silently accept a wildcard origin.
- Do not add a database or cross-process synchronization as an incidental refactor.

## Frontend, transport, and state

Keep the live Socket.IO client, listeners, storage access, and network exceptions in the transport boundary. Keep Zustand data serializable.

- Use one provider-scoped store for connection, session, room, normalized error, and forced-exit state.
- Keep actions outside persisted state and keep one-component form or disclosure state local to the component.
- Register each socket listener once and remove it during final cleanup.
- Resume only with a valid stored token and replace local state with the server's canonical snapshot.
- Keep API and event calls behind the typed transport instead of calling the socket throughout components.
- Cover connecting, connected, disconnected, retry, expired, kicked, closed, replaced-session, voting, revealed, and empty-result states.
- Preserve keyboard operation, accessible names, focus visibility, live announcements, reduced motion, and narrow-view usability.
- Do not add another global state library, event bus, or UI framework without an approved story.

## Design and Penpot rules

The checked token source in `packages/design-tokens/tokens/planning-poker.tokens.json` is the runtime source of truth. Generated CSS must come from the token build rather than hand-edited drift.

- Reuse semantic tokens for color, typography, spacing, radius, elevation, focus, and motion.
- Keep desktop and mobile states in one coherent component hierarchy where practical.
- When a story owns Penpot work, inspect the supplied design first and record only verified files, boards, components, token sets, and exports.
- Make design writes only within the approved story and verify the resulting export and repository implementation.
- Do not invent Penpot IDs, synchronization results, exports, or visual proof.
- Keep UI copy consistent with the product voice and use **participant** and **moderator** as defined terms.

## Screenshot and visual-evidence rules

Documentation images and visual baselines must use the isolated fixture in `apps/screenshots` with invented identities, fixed room data, and blocked external network access.

- Never connect screenshot automation to a live room, production service, personal browser profile, clipboard history, or private data.
- Capture the real built React interface, not a replacement static mock.
- Keep the pinned Playwright/container path for reviewed pixel comparisons.
- Inspect expected, actual, and diff images before replacing any baseline.
- Run `pnpm screenshots:update:container` only after explicit approval to update reviewed images.
- Keep transient Playwright reports, traces, videos, actual images, and diff images out of commits.

## Story execution

Work on one approved story or one explicitly requested maintenance change at a time.

1. Name the scope, likely files, boundaries, and checks.
2. Use the `architect` role for a cross-cutting, protocol, lifecycle, state, design, or release change.
3. Ask for clear plan approval before implementation when a plan gate applies.
4. Ask separately for clear implementation approval; plan approval is not implementation approval.
5. Modify only the approved scope and preserve unrelated behavior.
6. Run focused checks and report exact results, including any skipped gate and its reason.
7. Use the `reviewer` role for risky or cross-cutting work.
8. Propose one commit message and ask separately for commit approval.
9. Commit only after approval, report the hash, and ask before push or the next story.

Do not edit implementation files before implementation approval when the workflow requires that gate. Do not commit, push, reset shared history, force-push, or continue to another story without explicit approval for that action.

## Source comment rules

- Add a comment only when naming and structure cannot make the reason clear.
- Explain why; do not narrate the code.
- Prefer one short sentence and keep normal comment blocks to at most three short sentences.
- Do not paste plans, story text, logs, or change history into source comments.
- Preserve required tool directives and existing license notices.

## Codex roles

Use the smallest useful role:

- `architect` is read-only and plans one scoped change;
- `implementation_worker` implements one approved change;
- `reviewer` is read-only and checks behavior, boundaries, regressions, privacy, tests, and evidence.

Repository skills:

- `full-stack-delivery` for coordinated React, Express, Socket.IO, package, and configuration work;
- `realtime-room-lifecycle` for room, participant, vote, moderation, recovery, authorization, and cleanup behavior;
- `contracts-and-state` for shared schemas, event typing, transport, Zustand, and recovery state;
- `design-handoff` for design tokens, Penpot, responsive UI, accessibility, and copy;
- `screenshot-evidence` for Playwright E2E, deterministic fixtures, privacy, and reviewed visual baselines;
- `release-evidence` for story scope, verification commands, CI parity, release claims, and commit gates.

Do not invoke every role or skill for a small documentation-only correction.

## Verification

Start with the repository audit:

```bash
pnpm verify:repo
```

For implementation changes, run the smallest relevant checks and expand according to impact:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use focused package commands from `docs/testing.md` while iterating. Run `pnpm e2e` for user-flow, server/client integration, transport, recovery, or routing changes. Run `pnpm screenshots:container` for visual, token, layout, responsive, font, or screenshot-harness changes. Use `pnpm verify:release:container` for a release-candidate claim or when host dependencies are not trustworthy.

A passing command is evidence only for the code and environment it actually exercised. Never claim a release, screenshot, Penpot export, browser flow, or security property without checked evidence.
