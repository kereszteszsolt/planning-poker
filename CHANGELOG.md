# Changelog

All notable repository-level changes are documented here. Product behavior that is only proposed remains in the release plan and is not presented as shipped functionality.

## [Unreleased]

### Implemented for 0.2

- Environment-driven runtime endpoints, exact production CORS allowlists, payload and participant limits.
- Typed acknowledgements, UUID/name validation, safe room maps, stable participant sessions, reconnect fallback, and deterministic lifecycle/moderation behavior.
- Singleton frontend transport ownership, explicit connection states, accessible clipboard feedback, mixed-vote copy, and responsive join controls.
- Focused Socket.IO server integration tests and React transport/session/component tests.
- One root npm workspace with `apps/web`, `apps/server`, Turborepo tasks, one lockfile, and filterable root commands.
- Shared room, event, acknowledgement, error, value-set, and runtime-validation contracts consumed by both applications.

### Planned for 0.2
- Zustand-based client state boundaries.
- Design tokens and focused responsive UI polish.
- Penpot design handoff and repository exports.
- Privacy-safe automated screenshots.
- Automated tests and CI evidence.

See [Release 0.2: Experience foundation](docs/releases/release-0.2-experience-foundation/README.md).

## [0.1.0] - 2026-08-24

### Added

- Repository README aligned with the CrownGrid, LocalNook, and CiteNook documentation style.
- Documentation index, user guide, architecture diagrams, development guide, testing guide, design-system plan, privacy boundary, screenshot gallery, and release evidence.
- README support and contact details, release index, implemented Release 0.1 stories, and planned Release 0.2 stories with acceptance criteria.
- Planning Poker visual mark and a portable interface-plan SVG/PNG for future Penpot synchronization.
- Package verification report separating passed static checks from network-dependent checks.

### Fixed

- Removed the accidental trailing quote from the backend `dev-be` script.
- Corrected the backend package entry point from `dis` to `dist`.
- Aligned backend `module` with `moduleResolution: NodeNext` so TypeScript compilation is valid.
- Corrected repository documentation that previously described MUI and median statistics although the supplied frontend uses Tailwind CSS and does not calculate a median.

### Not changed

- Runtime event names, room data model, UI component structure, and in-memory storage behavior remain unchanged in this release.
