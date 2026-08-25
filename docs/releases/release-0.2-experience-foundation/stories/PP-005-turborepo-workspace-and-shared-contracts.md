# PP-005: Introduce a Turborepo workspace and shared contracts

## Status

Implemented

## User story

As a maintainer, I want one root workspace with explicit task and contract boundaries so that frontend and backend changes install, validate, test, and build together without duplicated types or separate lockfile drift.

## Acceptance criteria

### Workspace structure

- [x] The repository uses one root workspace and one committed root lockfile.
- [x] The frontend moves to `apps/web` and the backend moves to `apps/server`, with history-preserving moves where practical.
- [x] `packages/contracts` contains shared room, participant, value-set, event payload, acknowledgement, and public error-code definitions.
- [x] Runtime validation schemas live with or are generated from the shared contracts and are consumed at the server boundary.
- [x] `packages/config` contains only genuinely shared TypeScript, ESLint, or test configuration; application-specific settings remain local.
- [x] Old nested lockfiles, obsolete package metadata, and stale path references are removed in the same change.

### Turborepo tasks

- [x] `turbo.json` defines `dev`, `lint`, `typecheck`, `test`, `build`, and `screenshots` with explicit dependencies, inputs, environment variables, outputs, and persistence/cache behavior.
- [x] Long-running `dev` tasks are persistent and not cached.
- [x] Build tasks declare only real generated outputs such as `dist/**`; source, screenshots, and test fixtures are not incorrectly treated as cache output.
- [x] Environment variables that can change build or test behavior are included in task inputs or documented global environment configuration.
- [x] Root scripts invoke Turbo consistently and provide clear package filters for focused work.
- [x] Local cache artifacts are ignored; remote caching remains optional and is not required for a clean local build.

### Developer experience

- [x] A clean checkout requires one frozen install at the repository root.
- [x] The root development command starts both applications with documented ports and clean shutdown behavior.
- [x] Root lint, typecheck, test, and build commands work together and can also be filtered to one package.
- [x] The frontend imports shared contract types through package exports, not relative paths into the server.
- [x] The server imports the same event and acknowledgement contracts used by the client.
- [x] No circular dependency exists among apps and packages.
- [x] README, architecture, development, testing, and troubleshooting docs reflect the new paths and commands.

### Supplemental pnpm criterion

- [x] Corepack selects the pinned `pnpm@11.23.0`, and the documented Node.js minimum satisfies pnpm's engine requirement.
- [x] `pnpm-workspace.yaml` is the canonical workspace definition, and internal app/package dependencies use `workspace:*`.
- [x] `pnpm-lock.yaml` is the only dependency lockfile; `package-lock.json` and local pnpm stores are absent from the commit.
- [x] A clean `pnpm install --frozen-lockfile` plus root and filtered Turbo commands preserve the original PP-005 quality gate and runtime startup behavior.

### Behavior preservation

- [x] The workspace move does not intentionally change room behavior, UI layout, ports, or event semantics beyond changes already approved in PP-004.
- [x] Pre- and post-migration integration tests exercise the same core room matrix.
- [x] Production frontend and server builds start from their generated output in a clean environment.

## Out of scope

Changing package manager again after the approved pnpm supplement, enabling mandatory hosted remote caching, publishing packages to a registry, containerizing the applications, or adding unrelated shared utility packages is out of scope.

## Implementation notes

Implemented layout:

```text
apps/web
apps/server
packages/contracts
packages/config
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
```

`packages/design-tokens` is introduced by PP-007 after the workspace foundation exists. Keep the root task graph small and inspectable; Turborepo should remove command duplication, not hide application behavior.

## Verification evidence

The pnpm supplement was verified in `node:22.22.0-bookworm-slim` with Corepack and pnpm `11.23.0`. The clean frozen install passed pnpm's supply-chain policies, the root gate retained all 14 tests, the documented package filters passed, `pnpm dev` started both applications, and both production outputs returned HTTP 200. See the [verification report](../../../verification.md#pp-005-workspace-verification) for the command-level evidence and explicit browser-evidence boundary.
