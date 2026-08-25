# PP-007: Introduce design tokens and focused UI polish

## Status

Implementation and browser review complete

## User story

As a participant, I want a clear, responsive, accessible interface so that I can join, vote, understand status, and moderate from desktop or mobile without layout overflow, ambiguous feedback, or inconsistent controls.

## Acceptance criteria

### Token source and generation

- [x] `packages/design-tokens` contains the approved DTCG-compatible source for global, semantic, and component tokens.
- [x] The source covers the required palette, typography, spacing, sizing, radius, border, shadow, focus, and motion decisions without attempting to model unused design-system breadth.
- [x] A deterministic build generates CSS custom properties and any Tailwind integration artifact consumed by `apps/web`.
- [x] Generated files are either committed with an explicit policy or produced before build; the repository has one documented source of truth.
- [x] Token aliases resolve successfully and tests reject missing references, duplicate token paths, invalid values, and unreviewed generated drift.

### Responsive layout

- [x] Home and join forms use fluid widths with bounded max-widths and no fixed `657px` overflow.
- [x] The room workspace has reviewed desktop, tablet, and mobile compositions with usable scrolling for long participant lists and many vote cards.
- [x] Long room IDs, participant names, translated strings, and error messages wrap or truncate with accessible full-value access.
- [x] Primary voting remains visually dominant; room sharing and moderation are discoverable but secondary.
- [x] Revealing results does not cause avoidable page jumps or obscure controls.

### Interaction and feedback

- [x] Clipboard actions use an accessible toast or inline status with success/failure copy; blocking browser alerts are removed.
- [x] Buttons expose type, accessible name, hover, active, focus-visible, disabled, loading/pending, and error behavior where applicable.
- [x] Forms have persistent labels, validation messages associated with fields, Enter-key submission, and deliberate autofocus/focus restoration.
- [x] Connection, reconnect, recovered, unavailable, kicked, room-closed, and validation states use actionable copy and appropriate live-region behavior.
- [x] Voting cards communicate selected, submitted, hidden, revealed, and disabled states through shape/text/icon treatment as well as color.
- [x] Destructive moderator actions require clear target context and suitable confirmation where accidental activation would disrupt a session.

### Accessibility

- [x] Keyboard order follows the visual/task hierarchy at all supported breakpoints.
- [x] Focus indicators are visible and tokenized.
- [x] Essential text and controls meet WCAG AA contrast targets in every state.
- [x] Touch targets remain usable on mobile.
- [x] Reduced-motion preferences disable non-essential transitions.
- [x] Automated accessibility checks and manual keyboard/browser accessibility-tree smoke cover the core flow.

### Content corrections

- [x] The About page no longer displays Markdown markers and accurately describes in-memory storage, room-link access, and deployment-dependent TLS.
- [x] Statistics labels match the implemented mixed-vote calculation policy.
- [x] Product copy is concise and consistent with `Estimate. Discuss. Align.` without implying persistence or authentication.

### Scope control

- [x] Existing React component responsibilities are refactored only where required by the Zustand and token boundaries.
- [x] All four value sets and current core actions remain recognizable.
- [x] No unrelated rebrand, animation framework, icon-library expansion, or full component catalog is introduced.

## Out of scope

Dark mode, user-selectable themes, localization, a standalone published design-system package, a broad marketing redesign, and new estimation workflows are out of scope.

## Implementation notes

The earlier [`docs/design/planning-poker.tokens.draft.json`](../../../design/planning-poker.tokens.draft.json) remains a discussion seed. The approved source of truth is now [`packages/design-tokens/tokens/planning-poker.tokens.json`](../../../../packages/design-tokens/tokens/planning-poker.tokens.json); PP-008 must import this file. Components consume semantic variables so palette changes do not require JSX rewrites.

## Verification evidence

- `pnpm --filter @planning-poker/design-tokens build` generated the committed CSS artifact; `check` returned `TOKEN_CSS_CURRENT`.
- Four token tests cover source/CSS drift, alias failures, duplicate and invalid values, and seven essential WCAG AA contrast pairs.
- Component tests cover inline clipboard feedback without alerts, labelled join validation and form submission, non-color vote selection, axe-core accessibility checks, and confirmation before participant removal or vote reset.
- A clean Node 26.3.0 / pnpm 11.23.0 container passed root lint, typecheck, all 29 tests (4 contract, 4 token, 5 server, 16 web), and the production build.
- Targeted Prettier checks passed for every PP-007 code and token-package file; `git diff --check` reported no whitespace errors.
- The [browser and accessibility audit](../evidence/PP-007-browser-audit.md) records zero axe violations, real keyboard behavior, accessibility-tree inspection, 13-participant/14-card stress data, viewport geometry, capture hashes, and the named-screen-reader limitation.
