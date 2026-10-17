---
name: design-handoff
description: Use for Planning Poker React UI, accessible interaction, Penpot design references, DTCG design tokens and generated Tailwind/CSS integration.
---

# Design-to-code integration

- Read only the affected UI and `docs/design-system.md`; consult Penpot when a relevant design is actually connected.
- Keep `packages/design-tokens` the canonical DTCG source. Regenerate derived CSS; do not hand-edit generated tokens or create duplicate palettes.
- Reuse existing React/Tailwind components and semantic tokens. Preserve focus states, labels, mobile layouts and loading/error feedback.
- Compare to design evidence only for approved UI scope. Penpot MCP is optional and must not block nonvisual development.
- Use `screenshot-evidence` for controlled Playwright capture or baseline changes; design inspection alone is not screenshot proof.
