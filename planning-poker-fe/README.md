# Planning Poker frontend

The frontend is the React and Tailwind CSS browser application for creating, joining, and participating in estimation rooms.

Use the repository-level documentation as the source of truth:

- [Quick start](../README.md#quick-start)
- [Architecture](../docs/architecture.md)
- [Development guide](../docs/development.md)
- [Testing](../docs/testing.md)
- [Release 0.2 frontend plan](../docs/releases/release-0.2-experience-foundation/README.md)

Current local command:

```bash
npm ci
npm run dev-fe
```

The browser currently connects to `http://localhost:3000`. Environment-based configuration, a singleton transport boundary, Zustand, design tokens, and Turborepo are planned rather than claimed as implemented.
