# Codex agents and skills

`AGENTS.md` and the active `PP-*` story are the source of truth. The main session implements ordinary fixes directly; the three roles below are **optional**, never a mandatory workflow.

| Role | Use for | Ownership |
| --- | --- | --- |
| `architect` | Read-only risk assessment of multi-package event/state changes | No edits |
| `implementation_worker` | One approved delegated story | Sole writer |
| `reviewer` | Read-only inspection of risky diffs and evidence | No edits |

Skills are selected **by technology boundary**, not by business goal: React/Express/Turborepo, shared contracts/Zustand, Socket.IO lifecycle, design tokens/Penpot, Playwright screenshots, and release verification. Do not preload all six. Use one writer and scoped tests. Separate plan, implementation, commit and push approvals; never auto-spawn subagents.
