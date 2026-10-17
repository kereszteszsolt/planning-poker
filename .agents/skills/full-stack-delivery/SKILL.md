---
name: full-stack-delivery
description: Use for Planning Poker cross-package React/Vite, Express/Node, pnpm/Turborepo, configuration or coordinated frontend/backend changes.
---

# React / Express workspace delivery

1. Read one approved scope and the relevant package(s), not the full repo history.
2. Keep `pnpm` workspaces and Turborepo tasks as the source of build order; use each package's native scripts for focused iteration.
3. Keep browser UI state and network adapters separate; do not duplicate public models or runtime validation already in `packages/contracts`.
4. Preserve Express/Socket.IO ownership of authority and canonical snapshots; coordinate frontend/server changes at their actual shared contract.
5. Avoid adding databases, extra services, copied types or unnecessary state managers for small changes.
6. Run focused lint/typecheck/test/build for affected packages and add relevant socket/browser checks before claiming cross-boundary compatibility.
