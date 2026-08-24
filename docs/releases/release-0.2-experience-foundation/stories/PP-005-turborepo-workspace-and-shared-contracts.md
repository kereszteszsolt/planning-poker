# PP-005: Introduce a Turborepo workspace and shared contracts

## Status

Planned

## User story

As a maintainer, I want one root workspace with explicit task and contract boundaries so that frontend and backend changes install, validate, test, and build together without duplicated types or separate lockfile drift.

## Acceptance criteria

### Workspace structure

- [ ] The repository uses npm workspaces from one root `package.json` and one committed root lockfile.
- [ ] The frontend moves to `apps/web` and the backend moves to `apps/server`, with history-preserving moves where practical.
- [ ] `packages/contracts` contains shared room, participant, value-set, event payload, acknowledgement, and public error-code definitions.
- [ ] Runtime validation schemas live with or are generated from the shared contracts and are consumed at the server boundary.
- [ ] `packages/config` contains only genuinely shared TypeScript, ESLint, or test configuration; application-specific settings remain local.
- [ ] Old nested lockfiles, obsolete package metadata, and stale path references are removed in the same change.

### Turborepo tasks

- [ ] `turbo.json` defines `dev`, `lint`, `typecheck`, `test`, `build`, and `screenshots` with explicit dependencies, inputs, environment variables, outputs, and persistence/cache behavior.
- [ ] Long-running `dev` tasks are persistent and not cached.
- [ ] Build tasks declare only real generated outputs such as `dist/**`; source, screenshots, and test fixtures are not incorrectly treated as cache output.
- [ ] Environment variables that can change build or test behavior are included in task inputs or documented global environment configuration.
- [ ] Root scripts invoke Turbo consistently and provide clear package filters for focused work.
- [ ] Local cache artifacts are ignored; remote caching remains optional and is not required for a clean local build.

### Developer experience

- [ ] A clean checkout requires one `npm ci` at the repository root.
- [ ] `npm run dev` starts both applications with documented ports and clean shutdown behavior.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` work from the root and can also be filtered to one package.
- [ ] The frontend imports shared contract types through package exports, not relative paths into the server.
- [ ] The server imports the same event and acknowledgement contracts used by the client.
- [ ] No circular dependency exists among apps and packages.
- [ ] README, architecture, development, testing, and troubleshooting docs reflect the new paths and commands.

### Behavior preservation

- [ ] The workspace move does not intentionally change room behavior, UI layout, ports, or event semantics beyond changes already approved in PP-004.
- [ ] Pre- and post-migration integration tests exercise the same core room matrix.
- [ ] Production frontend and server builds start from their generated output in a clean environment.

## Out of scope

Changing package manager, enabling mandatory hosted remote caching, publishing packages to npm, containerizing the applications, or adding unrelated shared utility packages is out of scope.

## Implementation notes

Proposed target:

```text
apps/web
apps/server
packages/contracts
packages/config
package.json
package-lock.json
turbo.json
```

`packages/design-tokens` is introduced by PP-007 after the workspace foundation exists. Keep the root task graph small and inspectable; Turborepo should remove command duplication, not hide application behavior.

## Verification evidence

To be completed with a clean-checkout transcript, root and filtered commands, Turbo task summaries, cache-hit/miss evidence, package dependency graph, and production start smoke results.
