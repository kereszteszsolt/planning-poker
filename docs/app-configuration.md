# PointFlip app configuration

The canonical metadata and artwork catalog is [`brand/branding.json`](../brand/branding.json); see the [shared contract](../brand/README.md). Application styles remain in the existing design tokens. The UI imports the JSON at build time through its `app-info.ts` adapter; local artwork is bundled by Vite.

## Canonical identity

| Property | Value |
| --- | --- |
| Product name | `PointFlip` |
| Descriptor | `Real-time team estimation` |
| Tagline | `Estimate. Discuss. Align.` |
| Repository | `point-flip` |
| Frontend package | `@planning-poker/web` |
| Backend package | `@planning-poker/server` |
| Contracts package | `@planning-poker/contracts` |
| Story prefix | `PP-` |
| Maintainer | Keresztes Zsolt |
| Public website | `https://kereszteszsolt.hu/` |

Use **PointFlip** for the product; **Planning Poker** remains the name of the estimation technique. Use the repository and package slugs only for code, paths, clone commands, and configuration.

## Visual mark

[`readme-assets/planning-poker-mark.svg`](../readme-assets/planning-poker-mark.svg) is the original repository mark; its shared copy is [`brand/assets/mark.svg`](../brand/assets/mark.svg). It uses overlapping estimate cards and the existing primary blue. The mark may be reused for documentation and a future favicon after checking legibility at 16, 32, 48, and 96 pixels.

Do not imply that the mark is a trademark registration or that the generic Planning Poker technique belongs to this project.

## Voice

- Direct, calm, and team-oriented.
- Explain current limitations without alarmist or absolute claims.
- Prefer action labels such as **Create room**, **Join room**, **Reveal votes**, and **Reset votes**.
- Use **participant** for room members and **moderator** for the current facilitator role.
- Do not call transient in-memory room data a saved session.

## Technology naming

The current frontend uses React, Vite, Tailwind CSS, React Router, and Socket.IO Client. The backend uses Express, Socket.IO, TypeScript, and an in-memory room map. Do not describe the UI as Material UI unless MUI is actually introduced and used.

Turborepo and shared runtime-validated contracts are implemented by PP-005, Zustand by PP-006, design-token runtime generation by PP-007, Penpot synchronization by PP-008, deterministic screenshots by PP-009, and the real-stack test/CI release gate by PP-010.

## Support and contact

Public documentation may link the website, GitHub profile, repository Issues, ways-to-support page, and Buy Me a Coffee page. It intentionally publishes no email address. See [privacy and contact boundaries](privacy-and-contact.md).

## Repository rename checklist

The repository is now `point-flip`; stable `@planning-poker/*` package names and `PP-*` story IDs remain unchanged. For a later rename, review:

- GitHub repository settings and clone URL;
- README badges, clone commands, issue links, and screenshot references;
- the README support and contact section, documentation, changelog, and release story links;
- Vite base path and deployment configuration when applicable;
- package names only when deliberately approved;
- CI, hosting, status badges, and external references;
- archived screenshots or design exports that display the old slug.

Do not silently change the canonical repository slug in documentation before the repository is actually renamed.


## About and attribution

The navbar opens a native modal dialog without navigating away from the current game or room. The existing `/about` details route remains available. About uses the configured poster, description, author/project destinations, two support actions and voluntary-support notice. Links show descriptions and full destinations on focus/hover, with natural wrapping at narrow widths. Footer attribution shows the current year, author, Apache-2.0 license and author website. Metadata and artwork remain in the repository-root catalog; consumers use functional filenames.
