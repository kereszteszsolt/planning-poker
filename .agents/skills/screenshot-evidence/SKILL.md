---
name: screenshot-evidence
description: Use for Planning Poker deterministic Playwright E2E, screenshot-fixture setup, visual comparison, approved baseline updates and privacy-safe browser automation.
---

# Deterministic Playwright evidence

- Use `apps/screenshots` and the real built React UI; no static mock substitute for a capture.
- Use synthetic room IDs, participant names, known votes, fixed clock/randomness and isolated browser profiles.
- Never record real users, tokens, personal browser state or production room sessions.
- Verify screenshots against expected/actual/diff artifacts before suggesting baseline acceptance.
- Follow `docs/screenshots/README.md` and run `pnpm screenshots:container`; **update** commands need separate approval.
- Report viewport, environment, run command, observed differences and artifact locations; do not claim pixel parity without inspection.
