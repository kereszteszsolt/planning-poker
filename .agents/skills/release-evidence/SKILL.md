---
name: release-evidence
description: Maintain Planning Poker story scope, approval gates, repository checks, CI parity, verification records, visual proof, and release claims.
---

# Release evidence

Run the repository audit first:

```bash
pnpm verify:repo
```

For one scoped change:

1. Identify the active `PP-*` story or explicit maintenance request and the files it owns.
2. Present a plan and record clear plan approval when the workflow requires it.
3. Ask again and record clear implementation approval.
4. Implement only the approved outcomes and preserve unrelated files.
5. Run focused package checks while iterating.
6. Expand to `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` according to impact.
7. Run `pnpm e2e` for changed real-time user flows and `pnpm screenshots:container` for changed visual behavior.
8. Use `pnpm verify:release:container` before a release-candidate claim or when a clean pinned environment is required.
9. Record exact commands, environment limits, pass/fail results, and any intentionally skipped gate.
10. Propose one commit message, obtain separate commit approval, then report the resulting hash.
11. Ask before push or the next story.

Do not turn a plan into an implementation claim. Do not treat a generated screenshot, Penpot export, CI badge, or passing subset as proof of a gate it did not exercise. Baseline replacement requires separate explicit approval and visual review.
