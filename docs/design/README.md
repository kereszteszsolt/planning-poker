# Planning Poker Penpot handoff

PP-008 uses a connected local Penpot file as the review source and keeps repository exports as portable evidence. The older Release 0.1 board remains an archived planning artifact; it is not evidence that the connected file exists.

## Connected file

| Field | Value |
| --- | --- |
| File name | `Planning Poker` |
| Team ID | `9080f45a-69d5-801b-8008-5645e5939d3f` |
| Project ID | `1d8643d8-a490-819e-8008-889a61e32143` |
| File ID | `1d8643d8-a490-819e-8008-889a6887f689` |
| Page | `Planning Poker · Release 0.2` |
| Page ID | `1d8643d8-a490-819e-8008-889a6887f68a` |

Open the connected file at [the approved local Penpot workspace](http://localhost:9001/#/workspace?team-id=9080f45a-69d5-801b-8008-5645e5939d3f&file-id=1d8643d8-a490-819e-8008-889a6887f689&page-id=1d8643d8-a490-819e-8008-889a6887f68a). The URL is local-only and does not contain a private access token.

## Token synchronization

The imported source is [`packages/design-tokens/tokens/planning-poker.tokens.json`](../../packages/design-tokens/tokens/planning-poker.tokens.json), the same DTCG document used to generate the application CSS. Penpot has 80 imported tokens in three active custom sets:

| Set | Tokens | Purpose |
| --- | ---: | --- |
| `Global` | 46 | Raw color, typography, spacing, size, radius, border, shadow, and motion decisions |
| `Semantic` | 24 | Page, text, border, action, status, and focus meaning |
| `Components` | 10 | Panel, button, and voting-card decisions |

Penpot 2.16 does not retain an active theme containing these sets reliably, so the file intentionally uses all three as active custom sets and no theme. Aliases remain intact and resolve through the global → semantic → component hierarchy.

Platform adapters and exceptions are documented rather than hidden:

- DTCG `duration` values are imported as Penpot `number` tokens while preserving milliseconds.
- The DTCG font-family fallback array is retained in the source, but Penpot 2.16 cannot bind that array to text. Canvas text uses the locally available `Inter Tight`; size, weight, and color remain token-bound.
- Penpot 2.16 resolves the `#0F172A14` shadow color without its alpha. Component masters omit that shadow instead of displaying a misleading opaque shadow; the source and application keep the approved value.

## Board inventory

The connected page is organized as functional top-level boards rather than one flattened illustration:

| Area | Stable board names |
| --- | --- |
| Foundations | `00 · Foundations` |
| Components | `01 · Components · States` |
| Core flow | `02 · Home · Create room`, `02 · Join · Valid and invalid`, `02 · Vote · Hidden`, `02 · Results · Revealed and reset` |
| Edge cases | `02 · Edge cases · Overflow and mixed votes`, `02 · Edge cases · Empty and error states` |
| Moderation | `03 · Moderation · Delegate and remove`, `03 · Moderation · Loss and takeover` |
| Recovery and exit | `03 · Recovery · Reconnecting`, `03 · Recovery · Unrecoverable`, `03 · Exit · Kicked`, `03 · Exit · Room closed` |
| Responsive review | `04 · Responsive · Desktop`, `04 · Responsive · Tablet`, `04 · Responsive · Mobile` |

The foundations board records token hierarchy, type, spacing, radius, focus, status, 12/8/4-column intent, responsive breakpoints, minimum touch targets, and accessibility evidence boundaries. The three responsive review boards preserve the hierarchy with token-bound panels and component instances at their exact review dimensions.

### Stable board identifiers

| Board | Penpot ID | Review dimensions |
| --- | --- | ---: |
| `02 · Vote · Hidden` | `6d8f70d8-b034-8001-8008-892948ee2da1` | 360×620 |
| `04 · Responsive · Desktop` | `6d8f70d8-b034-8001-8008-892e123422aa` | 1440×800 |
| `04 · Responsive · Tablet` | `6d8f70d8-b034-8001-8008-892e2808b6eb` | 768×900 |
| `04 · Responsive · Mobile` | `6d8f70d8-b034-8001-8008-892e3d40e103` | 390×844 |
| `05 · Handoff overview` | `6d8f70d8-b034-8001-8008-892ec5a5e221` | 1600×900 |

## Component inventory and naming

Library elements use `Planning Poker / <functional group> / <semantic component>` paths:

- `Navigation / Room header`
- `Actions / Primary`
- `Forms / Labeled`
- `Voting / Default`
- `Panels / Room`
- `Participants / Default`
- `Results / Revealed`
- `Status / Warning`
- `Feedback / Success`

The component review board includes focus, hover, active, disabled, selected, submitted, hidden, revealed, loading, success, warning, and danger samples. Screen boards use component instances for the repeated navigation, input, action, vote, participant, result, status, and feedback patterns.

## Fixtures and privacy

All PP-008 content is invented. Examples use `Q7M-4KP`, Ada Moderator, Lin Participant, Grace Observer, and deliberately synthetic long-name/long-ID cases. No live room, real team member, clipboard content, account email, access token, or production data belongs in the connected file or its exports.

## Repository assets

| Asset | Role | Status |
| --- | --- | --- |
| [`planning-poker-interface-plan.svg`](planning-poker-interface-plan.svg) | Release 0.1 portable plan | Archived pre-Penpot plan |
| [`planning-poker-interface-plan.png`](planning-poker-interface-plan.png) | Release 0.1 rendered preview | Archived pre-Penpot plan |
| [`planning-poker.tokens.draft.json`](planning-poker.tokens.draft.json) | Early naming discussion | Archived; not the runtime/import source |
| [`planning-poker-penpot-overview.svg`](planning-poker-penpot-overview.svg) / [`.png`](planning-poker-penpot-overview.png) | Connected PP-008 overview-board export | Generated and visually inspected |
| [`planning-poker-penpot-vote-hidden.svg`](planning-poker-penpot-vote-hidden.svg) / [`.png`](planning-poker-penpot-vote-hidden.png) | Key hidden-vote board export | Generated and visually inspected |
| [`planning-poker-penpot.penpot`](planning-poker-penpot.penpot) | Portable connected-file backup with embedded assets | Fresh Penpot 2.16.2 export; ZIP integrity and manifest verified |

Export filenames above are stable. Their exact board IDs, dimensions, SHA-256 hashes, and visual-inspection result are recorded in [PP-008 verification evidence](../releases/release-0.2-experience-foundation/stories/PP-008-penpot-design-handoff.md).

## Implementation comparison

The current [PP-009 screenshot gallery](../screenshots/README.md) captures the shipped PP-007 hierarchy with deterministic desktop/mobile home, join, voting, results, and connection-loss states. The fresh images were reviewed against the Penpot hierarchy for voting priority, bounded participant content, focus/state cues, responsive stacking, and invented data. Pixel comparisons use those same committed gallery files as Playwright baselines; the former pre-PP-007 manual screenshot is no longer current evidence.

## Handoff update procedure

1. Change and validate the canonical DTCG source in `packages/design-tokens`.
2. Re-import the same source into the three active Penpot sets and verify aliases.
3. Update native components and affected functional/responsive boards.
4. Export the stable SVG, PNG, and `.penpot` filenames.
5. Visually inspect invented data, clipping, focus, overflow, and state copy.
6. Record dimensions and hashes in PP-008; compare current app captures under PP-009.
