# PP-008: Establish a Penpot design handoff

## Status

Planned

## User story

As a maintainer and contributor, I want a real Penpot design file synchronized with repository tokens and exports so that current behavior, proposed UI refinements, responsive intent, and edge states can be reviewed before implementation drifts.

## Acceptance criteria

### File and foundations

- [ ] A Penpot file named `Planning Poker` is created in the approved team/project and its team, project, file, and page identifiers are recorded in `docs/design/README.md`.
- [ ] The approved DTCG token source from `packages/design-tokens` is imported, with active sets/themes documented.
- [ ] Foundations boards cover token hierarchy, typography, spacing, radius, focus, status colors, grid, responsive breakpoints, and accessibility notes.
- [ ] The repository commits a fresh `.penpot` backup/export or the approved portable Penpot export format according to project policy.

### Components and states

- [ ] Reusable components exist for header/navigation, buttons, labeled inputs, voting cards, room panels, participant rows, result items, status banners, and feedback messages.
- [ ] Component names and variants follow the functional and semantic naming documented in the design-system guide.
- [ ] Focus, hover, active, disabled, selected, submitted, hidden, revealed, loading, success, warning, and danger states are represented where relevant.
- [ ] Components use Penpot token references rather than duplicated hard-coded values except for documented exceptions.

### Flows and responsive review

- [ ] Boards document home, join, hidden-vote room, revealed results, reset loop, delegation, participant removal, moderator loss/takeover, reconnecting, unrecoverable session, kicked, and room-closed states.
- [ ] Desktop, tablet, and mobile layouts preserve all current actions and follow the approved hierarchy.
- [ ] Long names, long room IDs, participant overflow, mixed vote cards, and error copy are included as stress cases.
- [ ] Invented fixture data is used throughout; no live room or personal team content appears in the design file or exports.

### Repository handoff

- [ ] Fresh SVG and PNG exports of the overall interface plan and key screen boards are committed under `docs/design/`.
- [ ] Export filenames and board identifiers are stable and documented.
- [ ] The existing portable repository board is either synchronized to the final design or explicitly retained as an archived pre-Penpot plan.
- [ ] README and documentation index link the Penpot handoff page.
- [ ] Differences between Penpot intent and implemented screenshots are reviewed and resolved or documented before release.

## Out of scope

Claiming Penpot completion from a repository-only SVG, designing unapproved product features, publishing private Penpot access tokens, or replacing implementation tests with design exports is out of scope.

## Implementation notes

Use functional boards rather than one chaotic canvas. Keep the design depth shallow, use Flex/Grid layouts intentionally, and preserve a clear path from foundations through components to flows and responsive review.

## Verification evidence

To be completed with exact Penpot identifiers, token import/export evidence, board/component inventory, fresh export dimensions and hashes, visual inspection notes, and privacy review.
