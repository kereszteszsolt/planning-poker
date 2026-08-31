---
name: screenshot-evidence
description: Implement or review one approved Planning Poker Playwright E2E, deterministic fixture, screenshot, visual-baseline, SVG-render, or privacy-evidence change.
---

# Screenshot evidence

- Use the isolated `apps/screenshots` harness and the real production-built React interface.
- Use only invented names, fixed room IDs, fixed votes, fixed clocks, and deterministic randomness.
- Bind fixture services to loopback and abort browser requests outside the documented local boundary.
- Never read a personal browser profile, clipboard history, live backend, production room, environment secret, or private application data.
- Keep visual capture separate from production runtime code.
- Preserve pinned Playwright, browser image, locale, timezone, viewport, color scheme, font readiness, animation, and serial-execution assumptions.
- For flow changes, exercise isolated browser contexts against the real server where the story requires it.
- For visual failures, inspect expected, actual, and diff images before deciding whether the implementation or the baseline is wrong.
- Update baselines only with explicit approval through `pnpm screenshots:update:container`.
- Run comparison through `pnpm screenshots:container` and record the exact result.
- Inspect final images for clipping, overflow, stale state, focus artifacts, private data, and semantic mismatch.
- Keep transient reports, traces, videos, actual images, and diff images uncommitted.

A generated file is not accepted evidence until its source, privacy boundary, dimensions or state, and visual review are known.
