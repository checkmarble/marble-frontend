---
paths:
  - "**/*.tsx"
  - "**/*.ts"
---

# Component Usage Conventions

- Never use a component, hook, or export marked `@deprecated`. Always use the replacement, which is usually named right after the deprecation notice (e.g. `@deprecated Use \`Collapsible\` instead.` → use `Collapsible`, not `CollapsibleV2`).
- When replacing a deprecated component, migrate to the new one's own API/props rather than forcing the old markup onto it.
