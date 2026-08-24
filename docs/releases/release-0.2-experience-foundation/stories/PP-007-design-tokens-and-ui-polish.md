# PP-007: Introduce design tokens and focused UI polish

## Status

Planned

## User story

As a participant, I want a clear, responsive, accessible interface so that I can join, vote, understand status, and moderate from desktop or mobile without layout overflow, ambiguous feedback, or inconsistent controls.

## Acceptance criteria

### Token source and generation

- [ ] `packages/design-tokens` contains the approved DTCG-compatible source for global, semantic, and component tokens.
- [ ] The source covers the required palette, typography, spacing, sizing, radius, border, shadow, focus, and motion decisions without attempting to model unused design-system breadth.
- [ ] A deterministic build generates CSS custom properties and any Tailwind integration artifact consumed by `apps/web`.
- [ ] Generated files are either committed with an explicit policy or produced before build; the repository has one documented source of truth.
- [ ] Token aliases resolve successfully and tests reject missing references, duplicate token paths, invalid values, and unreviewed generated drift.
- [ ] Penpot imports the same approved source in PP-008 rather than maintaining an independent color list.

### Responsive layout

- [ ] Home and join forms use fluid widths with bounded max-widths and no fixed `657px` overflow.
- [ ] The room workspace has reviewed desktop, tablet, and mobile compositions with usable scrolling for long participant lists and many vote cards.
- [ ] Long room IDs, participant names, translated strings, and error messages wrap or truncate with accessible full-value access.
- [ ] Primary voting remains visually dominant; room sharing and moderation are discoverable but secondary.
- [ ] Revealing results does not cause avoidable page jumps or obscure controls.

### Interaction and feedback

- [ ] Clipboard actions use an accessible toast or inline status with success/failure copy; blocking browser alerts are removed.
- [ ] Buttons expose type, accessible name, hover, active, focus-visible, disabled, loading/pending, and error behavior where applicable.
- [ ] Forms have persistent labels, validation messages associated with fields, Enter-key submission, and deliberate autofocus/focus restoration.
- [ ] Connection, reconnect, recovered, unavailable, kicked, room-closed, and validation states use actionable copy and appropriate live-region behavior.
- [ ] Voting cards communicate selected, submitted, hidden, revealed, and disabled states through shape/text/icon treatment as well as color.
- [ ] Destructive moderator actions require clear target context and suitable confirmation where accidental activation would disrupt a session.

### Accessibility

- [ ] Keyboard order follows the visual/task hierarchy at all supported breakpoints.
- [ ] Focus indicators are visible and tokenized.
- [ ] Essential text and controls meet WCAG AA contrast targets in every state.
- [ ] Touch targets remain usable on mobile.
- [ ] Reduced-motion preferences disable non-essential transitions.
- [ ] Automated accessibility checks and manual keyboard/screen-reader smoke cover the core flow.

### Content corrections

- [ ] The About page no longer displays Markdown markers and accurately describes in-memory storage, room-link access, and deployment-dependent TLS.
- [ ] Statistics labels match the implemented mixed-vote calculation policy.
- [ ] Product copy is concise and consistent with `Estimate. Discuss. Align.` without implying persistence or authentication.

### Scope control

- [ ] Existing React component responsibilities are refactored only where required by the Zustand and token boundaries.
- [ ] All four value sets and current core actions remain recognizable.
- [ ] No unrelated rebrand, animation framework, icon-library expansion, or full component catalog is introduced.

## Out of scope

Dark mode, user-selectable themes, localization, a standalone published design-system package, a broad marketing redesign, and new estimation workflows are out of scope.

## Implementation notes

Use the current [`docs/design/planning-poker.tokens.draft.json`](../../../design/planning-poker.tokens.draft.json) only as a discussion seed. Review names and values before moving them into the runtime package. Prefer semantic variables in components so palette changes do not require JSX rewrites.

## Verification evidence

To be completed with token validation output, generated-diff checks, contrast results, responsive viewport captures, keyboard/screen-reader notes, accessibility test results, and before/after UI review.
