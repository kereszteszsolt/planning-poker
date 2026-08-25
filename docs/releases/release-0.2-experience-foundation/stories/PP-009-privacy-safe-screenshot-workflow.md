# PP-009: Capture privacy-safe deterministic product screenshots

## Status

Implemented

## User story

As a repository visitor, I want current desktop and mobile screenshots generated from invented deterministic sessions so that I can understand the product without exposing a maintainer's room or relying on stale manual captures.

## Acceptance criteria

### Capture architecture

- [x] A dev-only Playwright workflow starts the real built or development React application and a deterministic test backend or transport fixture.
- [x] The workflow never connects to a maintainer's running backend, production deployment, browser profile, clipboard history, or private room.
- [x] All names, room IDs, votes, connection states, and messages are invented fixtures committed with the test.
- [x] Random UUIDs, timers, locale, timezone, viewport, color scheme, fonts, animations, and network timing are fixed or normalized.
- [x] The Playwright package version and browser/container image are pinned together.

### Required gallery

- [x] `planning-poker-home-desktop.png` shows the connected create/join entry point.
- [x] `planning-poker-join-desktop.png` shows the labeled join flow.
- [x] `planning-poker-room-voting-desktop.png` shows multiple participants with hidden votes and moderator controls.
- [x] `planning-poker-room-results-desktop.png` shows revealed numeric and special-card distribution.
- [x] `planning-poker-room-mobile.png` shows the full responsive voting workflow.
- [x] `planning-poker-disconnected-mobile.png` shows actionable connection-loss or unrecoverable-session handling.
- [x] Each image has a descriptive alt text and appears in `docs/screenshots/README.md`.

### Visual review and regression

- [x] Screenshot capture runs from the root through Turborepo and writes only the documented gallery outputs.
- [x] Critical layouts also use Playwright visual comparisons in the pinned environment, with baseline updates requiring explicit review.
- [x] Dynamic elements are stabilized without hiding meaningful UI defects.
- [x] Every final image is visually inspected for clipping, overflow, sensitive data, inconsistent focus, and stale design.
- [x] The legacy `Capture1.png` is archived or removed only after replacement links are verified.

### Documentation

- [x] README embeds a current representative screenshot and links the full gallery.
- [x] The screenshot guide records exact host and container commands, fixture source, viewport dimensions, and update procedure.
- [x] Testing documentation explains how to inspect expected, actual, and diff images.

## Out of scope

Marketing composites, videos, GIFs, production telemetry, end-to-end backlog integration, installing Playwright in production images, or copying live application data is out of scope.

## Implementation notes

A deterministic Socket.IO test server is preferable to screenshotting static HTML because it exercises the real event-driven UI. The fixture may expose test-only commands, but they must be excluded from production builds and clearly namespaced.

## Verification evidence

- Root update command: `pnpm screenshots:update:container`; root comparison command: `pnpm screenshots:container`. Both execute the screenshot package through Turborepo after a clean frozen install and production web build.
- Environment: `@playwright/test` `1.62.1`, Chromium from `mcr.microsoft.com/playwright:v1.62.1-noble`, pnpm `11.23.0`, `CI=1`, `TZ=UTC`, and `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`.
- Result: 6/6 gallery and pixel-comparison tests passed serially in isolated browser contexts. The fixture contract adds 2 deterministic Node tests to the root test graph.
- Fixture inventory: Ada Moderator, Lin Participant, Grace Observer, Sam Developer; four fixed room UUIDs plus one create-room UUID; fixed participant/session UUIDs; Scrum/Fibonacci numeric and `?`/`☕` votes; fixed clock/random functions and direct local acknowledgements.
- Network/privacy audit: the fixture binds only to `127.0.0.1:4173`, every browser request to a different host is aborted, and the clean container copy excludes `.env`, browser profiles, host dependencies/builds/caches, and prior test results. No clipboard, live backend, production service, or private room is read.
- Generated images and SHA-256:
  - `planning-poker-home-desktop.png` — 1440×968, `083179bf2201cf960ef27e07d5c8618cc64abcf13eaa15571766049f8e8b30d5`.
  - `planning-poker-join-desktop.png` — 1440×968, `bcc6480b05575ad557c5e51e933b52e52728b2d82a7aec5295b7c6345e15386b`.
  - `planning-poker-room-voting-desktop.png` — 1440×968, `225e42ebb854bf1121c36080cf4f10d0410dfd1679a8299c5888e199e380a5fa`.
  - `planning-poker-room-results-desktop.png` — 1440×1040, `54d95596340f61b4a455f315a845ae4bef354deeb955db2106a6f1543ffe0f2d`.
  - `planning-poker-room-mobile.png` — 430×1754, `75f60befd87ba7224e43e8e9a22720405739be0f1cc9831c4b4f95f67c252fe3`.
  - `planning-poker-disconnected-mobile.png` — 430×940, `85e61d1e97920a79aaa4147f8f81ea2aece71f376f82eddb95fe2f84d960288a`.
- Visual audit: all six decoded PNGs were inspected at original resolution. No clipping, horizontal overflow, private data, inconsistent focus, or stale pre-PP-007 layout remained; hidden/revealed states, special-card distribution, responsive stacking, and retry action are legible.
