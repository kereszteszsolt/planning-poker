# Codex project setup

This repository keeps three focused Codex roles:

- `architect` plans one scoped Planning Poker change and edits nothing;
- `implementation_worker` implements one change only after the required plan and implementation approvals;
- `reviewer` checks behavior, protocol boundaries, regressions, privacy, accessibility, tests, and evidence.

`AGENTS.md`, the active `PP-*` story, and the matching release documentation are the source of truth. Plan approval is not implementation approval. Implementation approval is not commit approval. Commit approval is not push or next-story approval.

For UI and design work, checked repository tokens, the connected Penpot handoff, the implemented React interface, and deterministic Playwright evidence must remain aligned. Visual-baseline replacement always requires explicit review and approval.
