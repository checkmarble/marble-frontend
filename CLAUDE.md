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

## Skills Reference

For coding patterns and best practices, use the skills system:

| Topic | Skill |
|-------|-------|
| React components, queries, routing, styling | `frontend-dev-guidelines` |
| Creating/managing skills and hooks | `skill-developer` |

Skills auto-activate based on your prompts. Check `.claude/skills/` for details.

## Task Management

### Starting Large Tasks

After planning, use `/dev-docs` to create persistent task documentation:

```
dev/active/[task-name]/
  [task-name]-plan.md      # The approved plan
  [task-name]-context.md   # Key files, decisions, dependencies
  [task-name]-tasks.md     # Checklist for tracking progress
```

### Continuing Tasks

1. Check `dev/active/` for existing tasks
2. Read all three files before proceeding
3. Update progress and context as you work
4. Use `/dev-docs-update` before context compaction

## Hooks (Auto-Running)

| Hook | Event | Purpose |
|------|-------|---------|
| SessionStart | Session start/resume/compact/clear | Show branch, restore context |
| PreToolUse | Edit/Write/MultiEdit | Block file edits on main/master branch |
| PreToolUse | Bash | Block dangerous commands (rm -rf, git push --force, git reset --hard) |
| Notification | Permission/idle prompt | macOS desktop notification when Claude needs attention |
| Stop | End of response | Auto-format with Biome + type-check modified TS files |

The Stop hook runs `biome format` and `bun run type-check` automatically. If type-check fails, Claude is blocked from stopping and shown the errors to fix. Use `auto-error-resolver` agent for complex multi-error situations.

## App-Builder Architecture

```
packages/app-builder/src/
  routes/           # Remix flat routes (_builder+, _auth+)
  components/       # Feature components (Cases/, Decisions/, etc.)
  queries/          # TanStack Query hooks (one file per query)
  repositories/     # Data access layer
  services/         # Business logic
  models/           # Types with adapters
  hooks/            # Custom React hooks
  schemas/          # Zod schemas
  utils/            # Utilities (routes/, i18n/, etc.)
```

## Common Patterns

### Imports
```typescript
// Internal
import { Case } from '@app-builder/models/cases';
import { useGetCasesQuery } from '@app-builder/queries/cases/get-cases';

// UI Design System
import { Button, Modal, Select } from 'ui-design-system';

// External
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import toast from 'react-hot-toast';
```

### Routes
- Flat routes with `+` folders: `_builder+/cases+/$caseId.tsx`
- Use `handle` for breadcrumbs
- Loaders for data fetching

## Troubleshooting

### TypeScript Errors After Edit
Run type-check manually after edits:
1. Run: `cd packages/app-builder && bun run type-check`
2. Use `auto-error-resolver` agent for multiple errors

### Skill Not Activating
Skills auto-activate based on descriptions in their SKILL.md files. Check `.claude/skills/[skill-name]/SKILL.md` description field.

### Build Issues
```bash
# Clear and rebuild
rm -rf packages/app-builder/build
cd packages/app-builder && bun run build
```
