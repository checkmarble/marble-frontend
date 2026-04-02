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
