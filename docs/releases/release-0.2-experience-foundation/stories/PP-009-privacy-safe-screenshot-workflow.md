# PP-009: Capture privacy-safe deterministic product screenshots

## Status

Planned

## User story

As a repository visitor, I want current desktop and mobile screenshots generated from invented deterministic sessions so that I can understand the product without exposing a maintainer's room or relying on stale manual captures.

## Acceptance criteria

### Capture architecture

- [ ] A dev-only Playwright workflow starts the real built or development React application and a deterministic test backend or transport fixture.
- [ ] The workflow never connects to a maintainer's running backend, production deployment, browser profile, clipboard history, or private room.
- [ ] All names, room IDs, votes, connection states, and messages are invented fixtures committed with the test.
- [ ] Random UUIDs, timers, locale, timezone, viewport, color scheme, fonts, animations, and network timing are fixed or normalized.
- [ ] The Playwright package version and browser/container image are pinned together.

### Required gallery

- [ ] `planning-poker-home-desktop.png` shows the connected create/join entry point.
- [ ] `planning-poker-join-desktop.png` shows the labeled join flow.
- [ ] `planning-poker-room-voting-desktop.png` shows multiple participants with hidden votes and moderator controls.
- [ ] `planning-poker-room-results-desktop.png` shows revealed numeric and special-card distribution.
- [ ] `planning-poker-room-mobile.png` shows the full responsive voting workflow.
- [ ] `planning-poker-disconnected-mobile.png` shows actionable connection-loss or unrecoverable-session handling.
- [ ] Each image has a descriptive alt text and appears in `docs/screenshots/README.md`.

### Visual review and regression

- [ ] Screenshot capture runs from the root through Turborepo and writes only the documented gallery outputs.
- [ ] Critical layouts also use Playwright visual comparisons in the pinned environment, with baseline updates requiring explicit review.
- [ ] Dynamic elements are stabilized without hiding meaningful UI defects.
- [ ] Every final image is visually inspected for clipping, overflow, sensitive data, inconsistent focus, and stale design.
- [ ] The legacy `Capture1.png` is archived or removed only after replacement links are verified.

### Documentation

- [ ] README embeds a current representative screenshot and links the full gallery.
- [ ] The screenshot guide records exact host and container commands, fixture source, viewport dimensions, and update procedure.
- [ ] Testing documentation explains how to inspect expected, actual, and diff images.

## Out of scope

Marketing composites, videos, GIFs, production telemetry, end-to-end backlog integration, installing Playwright in production images, or copying live application data is out of scope.

## Implementation notes

A deterministic Socket.IO test server is preferable to screenshotting static HTML because it exercises the real event-driven UI. The fixture may expose test-only commands, but they must be excluded from production builds and clearly namespaced.

## Verification evidence

To be completed with the exact Playwright command, test count, pinned image/version, generated dimensions and hashes, fixture inventory, visual-inspection record, and privacy audit.
