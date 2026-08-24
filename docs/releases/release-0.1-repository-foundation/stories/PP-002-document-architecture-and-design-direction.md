# PP-002: Document architecture and design direction

## Status

Implemented

## User story

As a maintainer, I want current architecture, known risks, user behavior, testing boundaries, and the next design direction documented so that future work can be planned without confusing proposals with shipped functionality.

## Acceptance criteria

- [x] The documentation index links user, architecture, development, testing, design, screenshot, privacy, reference, and release material.
- [x] Architecture documentation includes current system context, room model, event table, interaction sequence, lifecycle findings, and a separately labeled Release 0.2 target.
- [x] The user guide covers room creation/joining, voting, reveal/reset, value sets, moderator behavior, connection limitations, privacy, and troubleshooting.
- [x] Development and testing guides provide commands, repository maps, code boundaries, a 20-scenario manual smoke matrix, and explicit automation gaps.
- [x] Design-system documentation proposes global, semantic, and component token tiers plus bounded UI polish.
- [x] A valid JSON token draft is included but clearly marked non-runtime.
- [x] A portable SVG board and rendered PNG preview document core flow, desktop/mobile hierarchy, token tiers, and Release 0.2 principles.
- [x] Penpot documentation explicitly states that no connected Penpot file is claimed as created.
- [x] Screenshot documentation preserves the current baseline and defines a privacy-safe future capture matrix.

## Out of scope

Creating a real Penpot project, changing the React UI, generating new product screenshots, adding Zustand or Turborepo, or asserting automated test passes is out of scope.

## Implementation evidence

- `docs/README.md`
- `docs/architecture.md`
- `docs/user-guide.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/brand-configuration.md`
- `docs/design-system.md`
- `docs/design/README.md`
- `docs/design/planning-poker.tokens.draft.json`
- `docs/design/planning-poker-interface-plan.svg`
- `docs/design/planning-poker-interface-plan.png`
- `docs/screenshots/README.md`
- `docs/privacy-and-contact.md`
- `docs/references.md`

## Verification evidence

- The token draft passes JSON parsing.
- The SVG renders locally to a 1800×1050 PNG and is visually inspected.
- Mermaid blocks use GitHub-supported syntax and contain no external asset dependency.
- Current behavior statements were checked against the supplied frontend and backend source.
