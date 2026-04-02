---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/tests/**"
---

# Testing Conventions

- Run all tests: `bun run test:all`
- Run unit tests: `cd packages/app-builder && bun run unit-tests`
- Prefer running single test files over the whole suite for speed
