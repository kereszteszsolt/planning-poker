---
name: full-stack-delivery
description: Deliver or review one approved Planning Poker change across React, Express, Socket.IO, workspace packages, configuration, tests, or documentation.
---

# Full-stack delivery

1. Read `AGENTS.md`, the active `PP-*` story when present, and the relevant architecture and testing docs.
2. Confirm the required plan and implementation approvals before editing.
3. Follow the approved scope and acceptance criteria in order.
4. Trace each changed user action from React through the typed transport and Socket.IO event to the authoritative server mutation and returned snapshot.
5. Keep shared events, schemas, acknowledgements, errors, and room types in `@planning-poker/contracts`.
6. Keep live sockets, subscriptions, storage access, and network failures out of React state.
7. Keep server validation, membership authorization, room lifecycle, and recovery behavior explicit and testable.
8. Preserve loading, connected, disconnected, retry, voting, revealed, kicked, closed, and expired states.
9. Reuse canonical design tokens and existing package boundaries.
10. Remove replaced live code and add focused tests near the changed boundary.
11. Run exact package checks, then expand to root, E2E, or visual gates according to impact.
12. Show results and ask separately for commit approval.

Do not add a database, second state library, event bus, UI kit, copied contract model, or new service without an approved requirement.
