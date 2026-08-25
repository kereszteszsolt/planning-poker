# Planning Poker design tokens

[`tokens/planning-poker.tokens.json`](tokens/planning-poker.tokens.json) is the
approved, Penpot-compatible DTCG source of truth. It contains the bounded global,
semantic, and component token sets used by the application and intended for the
PP-008 Penpot import.

`pnpm --filter @planning-poker/design-tokens build` resolves aliases, validates
token values, and deterministically writes `dist/tokens.css`. The generated CSS
is committed so reviewers can inspect changes; edit the JSON source and rebuild
rather than editing the CSS directly. `check` fails when the committed artifact
has drifted from its source.

The web application imports `@planning-poker/design-tokens/css`. Turborepo's
dependency-aware build creates the artifact before web development, typecheck,
test, or build tasks run from a clean checkout.
