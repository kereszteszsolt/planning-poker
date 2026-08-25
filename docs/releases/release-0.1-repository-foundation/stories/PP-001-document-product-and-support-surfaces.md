# PP-001: Document product and support surfaces

## Status

Implemented

## User story

As a repository visitor, I want one accurate, polished entry point so that I can understand the application, run it, find documentation, report a problem, review its license, and support the maintainer without searching through source code.

## Acceptance criteria

- [x] The root README uses the product name `Planning Poker`, descriptor `Real-time team estimation`, and tagline `Estimate. Discuss. Align.`.
- [x] The technology description matches the supplied packages: React, Tailwind CSS, Express, and Socket.IO; Material UI is not claimed.
- [x] Highlights describe only current behavior and do not claim median statistics.
- [x] Quick-start and build commands identify both package installations and the two local ports.
- [x] Documentation, screenshot, architecture, and release links are visible near the top of the README.
- [x] The final top-level sections cover support and contact, licensing, ways to support, and project attribution.
- [x] Public links use the maintainer website, GitHub profile, user guide, ways-to-support page, and Buy Me a Coffee image.
- [x] The README and public documentation intentionally contain no email address.
- [x] `CHANGELOG.md` separates implemented 0.1 work from planned 0.2 work.

## Out of scope

Renaming the GitHub repository, adding an email address, promising service-level support, changing the Apache-2.0 license text, or implementing planned product features is out of scope.

## Implementation evidence

- `README.md`
- `CHANGELOG.md`
- `readme-assets/planning-poker-mark.svg`
- `docs/assets/buy-me-a-coffee-orange.png`

## Verification evidence

- README links and relative asset paths are included in the repository link check.
- Public support files were searched for email-address patterns; none are intended to be present.
- Technology names and statistic claims were compared with `package.json` files and `Statistics.tsx`.
