# Technical references

Release 0.2 decisions should be checked against primary project documentation rather than copied from secondary tutorials.

| Topic | Primary reference | Why it matters here |
| --- | --- | --- |
| Vite Node.js support | https://vite.dev/guide/ | Defines the runtime floor for the current Vite-based frontend |
| Socket.IO connection recovery | https://socket.io/docs/v4/connection-state-recovery | Explains recoverable versus unrecoverable reconnects and required server configuration |
| Socket.IO server-side socket identity | https://socket.io/docs/v4/server-socket-instance/ | Documents why `socket.id` is not a durable application identity by default |
| Zustand introduction | https://zustand.docs.pmnd.rs/ | Defines the store/hook model proposed for serializable client state |
| Zustand slices pattern | https://zustand.docs.pmnd.rs/learn/guides/slices-pattern | Supports separating connection, session, room, and UI concerns |
| Turborepo configuration | https://turborepo.com/docs/reference/configuration | Defines root tasks, dependencies, inputs, outputs, and cache behavior |
| Turborepo task design | https://turborepo.com/docs/crafting-your-repository/configuring-tasks | Helps avoid caching long-running development tasks or missing build outputs |
| pnpm workspace | https://pnpm.io/workspaces | Defines the canonical workspace file and `workspace:` dependency protocol |
| pnpm settings | https://pnpm.io/settings | Documents release-age, build-script, engine, and lockfile policy in `pnpm-workspace.yaml` |
| Penpot design tokens | https://help.penpot.app/user-guide/design-systems/design-tokens/ | Confirms DTCG-compatible token import/export and aliases |
| Penpot design structure | https://help.penpot.app/mcp/design-file-structure-best-practices/ | Supports global, semantic, and component token tiers plus functional boards |
| Penpot file export/import | https://help.penpot.app/user-guide/export-import/export-import-files/ | Defines repository backup and portable handoff options |
| Playwright screenshots | https://playwright.dev/docs/screenshots | Defines deterministic page and element capture APIs |
| Playwright visual comparisons | https://playwright.dev/docs/test-snapshots | Defines reviewed screenshot baselines and environment sensitivity |

These links are references, not proof that the associated feature is implemented. Story evidence must point to repository source, commands, and reviewed output.
