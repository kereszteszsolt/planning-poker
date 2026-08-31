---
name: design-handoff
description: Plan, implement, or review one approved Planning Poker design-token, Penpot, React UI, accessibility, responsive-state, or copy change.
---

# Design handoff

- Read `docs/design-system.md`, `docs/design/README.md`, `docs/brand-configuration.md`, and the relevant screenshot documentation.
- Keep `packages/design-tokens/tokens/planning-poker.tokens.json` as the checked token source and regenerate CSS through the package build.
- Do not hand-edit generated token output into a state that the token check cannot reproduce.
- When a story owns Penpot work, inspect the focused design first and record only verified files, boards, components, token sets, and export names.
- Describe Penpot writes in the approved plan, keep them small and reversible, then re-inspect and export the final design evidence.
- Do not claim synchronization, an ID, or an export without checked evidence.
- Keep the existing component hierarchy coherent across desktop and mobile where practical.
- Cover keyboard access, focus visibility, labels, live announcements, contrast, reduced motion, touch targets, and overflow.
- Preserve connecting, empty, voting, hidden-vote, revealed, error, retry, kicked, closed, and disconnected states.
- Use the defined **participant** and **moderator** terms and keep copy direct and calm.
- Capture the real built UI with the deterministic screenshot harness when visual evidence is required.
- Keep invented data and privacy boundaries intact.

Design approval, implementation approval, screenshot-baseline approval, and commit approval are separate decisions.
