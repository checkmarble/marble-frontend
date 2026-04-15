# Marble Frontend

## Quick Commands

```bash
# Development
cd packages/app-builder && bun run dev     # Start dev server

# Type Checking
cd packages/app-builder && bun run type-check    # TypeScript check
cd packages/ui-design-system && bun run type-check

# Build
cd packages/app-builder && bun run build   # Build app

# Testing
bun run test:all                           # Run all tests
cd packages/app-builder && bun run unit-tests

# Formatting
bun run format:write                       # Format all files
bun run format:check                       # Check formatting

# Generate Routes
cd packages/app-builder && bun run generate-routes
```

## Monorepo Structure

```
packages/
  app-builder/         # Main Remix application (routes, components, queries)
  backoffice/          # Backoffice application
  ui-design-system/    # Reusable UI components (Button, Modal, Select, etc.)
  ui-icons/            # Icon components
  marble-api/          # Generated API client
  shared/              # Shared utilities
  tailwind-preset/     # Tailwind configuration
  typescript-utils/    # TypeScript utilities
  tests/               # E2E and integration tests
```

## Tech Stack

- **Bun** - Package manager and runtime
- **Remix** - Full-stack React framework
- **React 18** - UI library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS 4** - Styling
- **TanStack Query** - Server state management
- **TanStack Form** - Form handling
- **Zod** - Schema validation
- **Biome** - Linting and formatting

## App-Builder Architecture

```
packages/app-builder/src/
  routes/           # Remix flat routes (_builder+, _auth+, ressources+)
  components/       # Feature components (Cases/, Decisions/, etc.)
  core/             # createServerFn, data(), request utilities
  middlewares/      # authMiddleware, handleRedirectMiddleware
  contexts/         # React contexts
  queries/          # TanStack Query hooks (one file per query)
  repositories/     # Data access layer
  services/         # Business logic
  models/           # Types with adapters
  hooks/            # Custom React hooks
  schemas/          # Zod schemas
  locales/          # i18n (en/, fr/, ar/)
  utils/            # Utilities (routes/, format, etc.)
```

## Common Patterns

### Imports
```typescript
// Internal
import { Case } from '@app-builder/models/cases';
import { useGetCasesQuery } from '@app-builder/queries/cases/get-cases';

// UI Design System
import { Button, Modal, Select, cn } from 'ui-design-system';

// External
import { useQuery } from '@tanstack/react-query';
import { match } from 'ts-pattern';
```

### Routes
- Flat routes with `+` folders: `_builder+/cases+/$caseId.tsx`
- Use `handle` for breadcrumbs
- Loaders for data fetching

## Task Management

After planning, use `/dev-docs` to create persistent task documentation in `dev/active/[task-name]/`. Use `/dev-docs-update` before context compaction.

## Troubleshooting

### Build Issues
```bash
rm -rf packages/app-builder/build
cd packages/app-builder && bun run build
```

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **marble-frontend** (5490 symbols, 15374 relationships, 299 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/marble-frontend/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/marble-frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/marble-frontend/clusters` | All functional areas |
| `gitnexus://repo/marble-frontend/processes` | All execution flows |
| `gitnexus://repo/marble-frontend/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
