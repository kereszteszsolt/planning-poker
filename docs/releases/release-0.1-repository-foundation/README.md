# Release 0.1: Repository foundation

## Status

Implemented in the supplied documentation package.

## Goal

Turn the existing Planning Poker example into a repository that can be understood, run, reviewed, supported, and improved without first reverse-engineering every source file.

## Scope

- Product identity, badge row, accurate technology description, quick start, screenshot, architecture overview, privacy boundary, and final License/Support/Made with love sections.
- User, architecture, development, testing, design-system, Penpot-handoff, screenshot, privacy, and reference documentation.
- Mermaid diagrams plus a portable SVG/PNG interface plan.
- Public support and contact details with no email address in the README or documentation.
- Release evidence, a package verification report, and a detailed Release 0.2 backlog.
- Two narrow package metadata fixes required for the documented backend start/build paths.

## Stories

| Story | Status | Outcome |
| --- | --- | --- |
| [PP-001](stories/PP-001-document-product-and-support-surfaces.md) | Implemented | Repository entry point, support, license, contact, and changelog |
| [PP-002](stories/PP-002-document-architecture-and-design-direction.md) | Implemented | Architecture, user/developer/testing docs, diagrams, token draft, and portable interface board |
| [PP-003](stories/PP-003-correct-local-startup-metadata.md) | Implemented | Correct backend development command and package entry point |

## Exit criteria

- [x] The README describes React, Tailwind CSS, Express, and Socket.IO accurately.
- [x] The README no longer claims median calculation.
- [x] License, Support, and Made with love are the final three top-level README sections.
- [x] All public support surfaces avoid publishing an email address.
- [x] Current architecture and planned Release 0.2 architecture are visibly separated.
- [x] Documentation includes at least one architecture diagram and one portable design board.
- [x] Release 0.2 contains explicit stories for bugs, Penpot, screenshots, UI, tokens, Zustand, Turborepo, and tests.
- [x] The backend `dev-be` script, `dist` entry-point metadata, and NodeNext TypeScript module pairing are corrected without refactoring runtime behavior.
- [x] Static checks and the unavailable dependency-backed checks are recorded without overstating verification.

## Known limitations carried forward

No runtime room lifecycle, reconnection, authorization, validation, responsive UI, state-management, monorepo, screenshot automation, or test-suite work is claimed as implemented. Those items belong to Release 0.2.
