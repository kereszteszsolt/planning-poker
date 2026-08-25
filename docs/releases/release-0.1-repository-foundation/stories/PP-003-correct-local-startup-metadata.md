# PP-003: Correct local startup metadata

## Status

Implemented

## User story

As a developer following the README, I want the existing backend development and build metadata to point at valid commands and paths so that documentation does not direct me into known typographical failures.

## Acceptance criteria

- [x] `planning-poker-be/package.json` defines `dev-be` as `nodemon ./src/index.ts` without an unmatched trailing quote.
- [x] The backend `main` entry points to `./dist/index.js`.
- [x] Backend TypeScript uses `module: NodeNext` with `moduleResolution: NodeNext`, removing TS5110.
- [x] The combined `dev-concurrently` command remains available and still starts the existing frontend script through its current relative path.
- [x] No Socket.IO event, room model, port, application dependency, or UI source is changed in this story.
- [x] README and development documentation explain the two-package install requirement.

## Out of scope

Root workspaces, environment variables, Turborepo, package upgrades, code refactoring, runtime lifecycle fixes, and test framework installation are out of scope.

## Implementation evidence

- `planning-poker-be/package.json`
- `planning-poker-be/tsconfig.json`
- `README.md`
- `docs/development.md`

## Verification evidence

- Package and TypeScript configuration JSON parse successfully.
- `tsc -p planning-poker-be/tsconfig.json --noEmit` no longer reports the module/moduleResolution pairing error.
- The changed script is inspected for balanced quoting and the compiled entry path matches `tsconfig.json` output intent.
- Full dependency installation and build results are recorded separately in the final package verification report; this story does not claim a pass without that evidence.
