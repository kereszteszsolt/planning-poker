# PP-008: Establish a Penpot design handoff

## Status

Implemented

## User story

As a maintainer and contributor, I want a real Penpot design file synchronized with repository tokens and exports so that current behavior, proposed UI refinements, responsive intent, and edge states can be reviewed before implementation drifts.

## Acceptance criteria

### File and foundations

- [x] A Penpot file named `Planning Poker` is created in the approved team/project and its team, project, file, and page identifiers are recorded in `docs/design/README.md`.
- [x] Penpot imports the same approved DTCG source from `packages/design-tokens`, rather than maintaining an independent color list, with active sets/themes documented.
- [x] Foundations boards cover token hierarchy, typography, spacing, radius, focus, status colors, grid, responsive breakpoints, and accessibility notes.
- [x] The repository commits a fresh `.penpot` backup/export or the approved portable Penpot export format according to project policy.

### Components and states

- [x] Reusable components exist for header/navigation, buttons, labeled inputs, voting cards, room panels, participant rows, result items, status banners, and feedback messages.
- [x] Component names and variants follow the functional and semantic naming documented in the design-system guide.
- [x] Focus, hover, active, disabled, selected, submitted, hidden, revealed, loading, success, warning, and danger states are represented where relevant.
- [x] Components use Penpot token references rather than duplicated hard-coded values except for documented exceptions.

### Flows and responsive review

- [x] Boards document home, join, hidden-vote room, revealed results, reset loop, delegation, participant removal, moderator loss/takeover, reconnecting, unrecoverable session, kicked, and room-closed states.
- [x] Desktop, tablet, and mobile layouts preserve all current actions and follow the approved hierarchy.
- [x] Long names, long room IDs, participant overflow, mixed vote cards, and error copy are included as stress cases.
- [x] Invented fixture data is used throughout; no live room or personal team content appears in the design file or exports.

### Repository handoff

- [x] Fresh SVG and PNG exports of the overall interface plan and key screen boards are committed under `docs/design/`.
- [x] Export filenames and board identifiers are stable and documented.
- [x] The existing portable repository board is either synchronized to the final design or explicitly retained as an archived pre-Penpot plan.
- [x] README and documentation index link the Penpot handoff page.
- [x] Differences between Penpot intent and implemented screenshots are reviewed and resolved or documented before release.

## Out of scope

Claiming Penpot completion from a repository-only SVG, designing unapproved product features, publishing private Penpot access tokens, or replacing implementation tests with design exports is out of scope.

## Implementation notes

Use functional boards rather than one chaotic canvas. Keep the design depth shallow, use Flex/Grid layouts intentionally, and preserve a clear path from foundations through components to flows and responsive review.

## Verification evidence

- Connected target verified as `Planning Poker` in the approved team/project: file `1d8643d8-a490-819e-8008-889a6887f689`, page `1d8643d8-a490-819e-8008-889a6887f68a` (`Planning Poker · Release 0.2`). Team and project identifiers are recorded in [`docs/design/README.md`](../../../design/README.md).
- Imported the canonical [`planning-poker.tokens.json`](../../../../packages/design-tokens/tokens/planning-poker.tokens.json): `Global` 46, `Semantic` 24, and `Components` 10 tokens; all three sets are active, aliases resolve, and no unreliable Penpot 2.16 theme is claimed.
- The native `00 · Foundations` board contains 84 named children and verified token bindings for type size/weight, fills, strokes, radii, focus width, and minimum control height. PNG export inspection found the color, focus, status, grid, and accessibility sections readable after correcting the spacing/radius row.
- The local component library contains nine semantic components under `Planning Poker` functional paths. The `01 · Components · States` PNG export was visually inspected for centered labels, non-color state cues, clipping, and invented data.
- Twelve functional flow/edge boards cover the checked flow and stress criteria. Repeated UI uses component instances; fixtures use only invented names and room identifiers.
- Responsive boards were exported and visually inspected at 1440×800, 768×900, and 390×844. Voting remains first, participant content stays bounded, selected/submitted cues remain visible, and current room actions are explicitly retained.
- Fresh connected-board exports:
  - `planning-poker-penpot-overview.svg` — board `6d8f70d8-b034-8001-8008-892ec5a5e221`, 1600×900 intent, SHA-256 `d77c300deb41966e8f661b413de6e76762af3fe84f0d90a7cc7ff5700cbf5b61`.
  - `planning-poker-penpot-overview.png` — 1600×900, SHA-256 `fb9cb58a8e198b20165d0053c3c1e64af4a95e50377602fee05fa551f2075460`.
  - `planning-poker-penpot-vote-hidden.svg` — board `6d8f70d8-b034-8001-8008-892948ee2da1`, 360×620 intent, SHA-256 `fbb5351467c8fad4e1188718cc58f58431891e41543551e4b90cfc59c3e53030`.
  - `planning-poker-penpot-vote-hidden.png` — 360×620, SHA-256 `ed49dca04b9fb034ca04c188b271c3dfbdd2f7259266e35ab14778ddd544fa52`.
- Fresh native [`planning-poker-penpot.penpot`](../../../design/planning-poker-penpot.penpot) backup — 2,098,611 bytes, SHA-256 `a4fd3ee6df39850cbaac564090ce7e7d852e48f5e2b75d4c09c18d4585aac852`. The Penpot 2.16.2 export contains 846 ZIP entries and passed a full CRC check; its manifest identifies `Planning Poker` and the expected file ID, while the archive includes the page index, 9 components, token data, and 88 embedded PNG assets.
- The repository PNGs were opened after decoding and inspected for clipping, invented fixture data, readable focus/state cues, and stale content. Both SVGs were confirmed as UTF-8 SVG images.
- Penpot 2.16 rejects the multi-family DTCG font token when bound to text and loses alpha while resolving the panel-shadow token. The connected board and handoff documentation retain the source values and state the canvas exceptions explicitly.
- The archived implementation screenshot was compared at the hierarchy level. Its older UUID-based, dense layout is documented as pre-PP-007; deterministic current pixel comparison remains PP-009 work.
- Penpot's plugin API exposes the file name as read-only and its documented `File.export` variants returned `No matching clause`. The approved local instance was therefore renamed and exported through Penpot's authenticated backend RPC, with the access-token feature enabled only for the operation and disabled again immediately afterward. No access token or private content was written to the repository.
