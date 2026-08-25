# PP-007 browser and accessibility audit

## Environment

- Date: 2026-08-25
- Runtime: production web build and live Socket.IO server
- Browser: Chromium from `mcr.microsoft.com/playwright:v1.62.1-noble`
- Accessibility engine: axe-core 4.13.0, WCAG 2 A/AA and 2.1 A/AA tags
- Fixture: one synthetic moderator plus twelve synthetic participants with long display names; no personal or live-room data

## Responsive stress review

The same live room contained 13 participants and all 14 Scrum cards. The rendered screenshots were inspected after the automated geometry checks.

| Viewport | Layout columns | Horizontal overflow | Participant list | Smallest vote card |
| --- | ---: | ---: | --- | ---: |
| Desktop, 1440 × 900 | 2 | 0 px | Scrolls within its panel | 71.47 px |
| Tablet, 834 × 1112 | 2 | 0 px | Scrolls within its panel | 65.33 px |
| Mobile, 390 × 844 | 1 | 0 px | Scrolls within its panel | 61.59 px |

The desktop and tablet renders keep voting/results before the room sidebar. The mobile render stacks voting, results, room sharing, and participants in the same task order. Long participant names and the full UUID remain available through accessible text or `title` values. Revealed-result space remains reserved by the results panel.

## Accessibility evidence

- axe reported zero violations on home, join, desktop room, tablet room, and mobile room states.
- The repository-level jsdom audit covers join and the core voting, room, and participant controls. Runtime contrast is also protected by the design-token contrast test.
- Home keyboard order was `Home`, `About`, `Create Room`, `Room ID`.
- The join name field received deliberate autofocus and Enter submitted the form.
- Enter activated a voting card, exposed `aria-pressed=true` with visible `Selected` text, and retained a solid 2 px focus outline.
- All reviewed controls used natural tab order; no positive `tabindex` was present. Main voting controls preceded sidebar controls at every breakpoint.
- Chromium accessibility-tree snapshots exposed named navigation, main, voting, results, room, and participant regions; labels for every form field, voting card, and moderator action were present.

An actual NVDA, JAWS, VoiceOver, or Orca audio session was not available in this environment. The browser accessibility-tree inspection is recorded as supporting evidence, not as a claim that a specific screen reader was executed.

## Ephemeral captures

The captures were generated only for this review and were not committed because PP-009 owns the deterministic repository screenshot workflow.

| Capture | Dimensions | SHA-256 |
| --- | --- | --- |
| Home desktop | 1440 × 908 | `098bbd33fe73c688743a6a21737d572bb133508162197c7e0996a3e6f0f03d51` |
| Join desktop | 1440 × 908 | `29cdfb8e6699912668287573979a380b53e0234d407ac29e09c96f4ca64d36eb` |
| Room desktop | 1440 × 961 | `1822417b5915eb6db2248daf7c958e0b6f2b3c8aea3a454068f09cbf2758eab1` |
| Room tablet | 834 × 1249 | `f688de1230e40003d1dcf3a20bbfc671b512d5b7f32acd88678eaea11018d172` |
| Room mobile | 390 × 2215 | `aee8769b90a1171f8eb6232992bd740d852c50639cbc2dbbd26db1f3aaecdc5e` |
