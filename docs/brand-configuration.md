# Planning Poker brand configuration

## Canonical identity

| Property | Value |
| --- | --- |
| Product name | `Planning Poker` |
| Descriptor | `Real-time team estimation` |
| Tagline | `Estimate. Discuss. Align.` |
| Repository | `example-planning-poker-react-express-socket-io` |
| Frontend package | `@planning-poker/web` |
| Backend package | `@planning-poker/server` |
| Contracts package | `@planning-poker/contracts` |
| Story prefix | `PP-` |
| Maintainer | Keresztes Zsolt |
| Public website | `https://kereszteszsolt.hu/` |

Use **Planning Poker** in prose and headings. Use the repository and package slugs only for code, paths, clone commands, and configuration.

## Visual mark

[`readme-assets/planning-poker-mark.svg`](../readme-assets/planning-poker-mark.svg) is the repository mark. It uses overlapping estimate cards and the existing primary blue. The mark may be reused for documentation and a future favicon after checking legibility at 16, 32, 48, and 96 pixels.

Do not imply that the mark is a trademark registration or that the generic Planning Poker technique belongs to this project.

## Voice

- Direct, calm, and team-oriented.
- Explain current limitations without alarmist or absolute claims.
- Prefer action labels such as **Create room**, **Join room**, **Reveal votes**, and **Reset votes**.
- Use **participant** for room members and **moderator** for the current facilitator role.
- Do not call transient in-memory room data a saved session.

## Technology naming

The current frontend uses React, Vite, Tailwind CSS, React Router, and Socket.IO Client. The backend uses Express, Socket.IO, TypeScript, and an in-memory room map. Do not describe the UI as Material UI unless MUI is actually introduced and used.

Turborepo and shared runtime-validated contracts are implemented by PP-005. Zustand, design-token runtime generation, Penpot synchronization, deterministic Playwright screenshots, and CI remain later Release 0.2 plans until their stories contain implementation evidence.

## Support and contact

Public documentation may link the website, GitHub profile, repository Issues, ways-to-support page, and Buy Me a Coffee page. It intentionally publishes no email address. See [privacy and contact boundaries](privacy-and-contact.md).

## Repository rename checklist

A shorter repository name may be considered separately. A rename is complete only when the following are updated together:

- GitHub repository settings and clone URL;
- README badges, clone commands, issue links, and screenshot references;
- the README support and contact section, documentation, changelog, and release story links;
- Vite base path and deployment configuration when applicable;
- package names only when deliberately approved;
- CI, hosting, status badges, and external references;
- archived screenshots or design exports that display the old slug.

Do not silently change the canonical repository slug in documentation before the repository is actually renamed.
