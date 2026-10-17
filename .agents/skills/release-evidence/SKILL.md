---
name: release-evidence
description: Use for Planning Poker PP story approval records, repository audits, CI parity, verification reports and release/documentation integrity.
---

# Repository and release checks

- Read only one active `PP-*` story and its release map; preserve older implementation evidence.
- Start with `pnpm verify:repo` for link/config/source audits; use relevant package tests before broad release verification.
- Record exact commands, test counts, skipped checks, screenshot/CI limitations and approved environment.
- Distinguish observed results from product claims; do not rewrite measured numbers or approve yourself to update image baselines.
- Review the diff, propose a commit, and wait for separate approval before committing, pushing or starting a new story.
