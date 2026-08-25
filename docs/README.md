# Planning Poker releases

| Release | Status | Purpose |
| --- | --- | --- |
| [0.1 · Repository foundation](releases/release-0.1-repository-foundation/README.md) | Implemented in this package | Accurate README, support surface, architecture and user documentation, diagrams, design handoff assets, screenshot gallery, and release evidence |
| [0.2 · Experience foundation](releases/release-0.2-experience-foundation/README.md) | Release candidate | Runtime hardening, Turborepo, shared contracts, Zustand, design tokens, UI polish, Penpot, screenshots, tests, and CI |

## Design and verification

- [Design-system and token contract](design-system.md)
- [Connected Penpot design handoff](design/README.md)
- [Screenshot gallery and capture policy](screenshots/README.md)
- [Testing and verification](testing.md)

## Release rules

- A planned story remains unchecked until source, test, and review evidence exists.
- Moving files or adding tooling does not by itself satisfy a user-facing acceptance criterion.
- A screenshot is evidence only when its fixture source and privacy boundary are documented.
- A Penpot story is complete only when the actual design file or board exists and fresh exports are committed.
- Documentation must distinguish the current in-memory demo from future authentication, persistence, or production-hosting ambitions.
