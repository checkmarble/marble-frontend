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
  app-builder/         # Main TanStack Start application (routes, components, queries, server-fns)
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
- **TanStack Start** - SSR React framework (Vite + Nitro)
- **TanStack Router** - File-based routing
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
  routes/           # TanStack Router file-based routes (_app/, ressources/)
  server-fns/       # createServerFn handlers called via React Query (auth, cases, etc.)
  components/       # Feature components (Cases/, Decisions/, etc.)
  middlewares/      # authMiddleware, servicesMiddleware, caseDetailMiddleware
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
- File-based routing: `_app/_builder/cases.$caseId.tsx` (underscore prefix = layout route, `$param` = dynamic segment, dot-separated filename = nested URL path)
- Define routes with `createFileRoute('/_app/_builder/cases')({ staticData, loader, component })`
- Use `staticData.BreadCrumbs` (array of render functions) for breadcrumbs
- Loaders: inline `createServerFn().middleware([authMiddleware]).handler(...)` passed to the route's `loader` option

## Task Management

After planning, use `/dev-docs` to create persistent task documentation in `dev/active/[task-name]/`. Use `/dev-docs-update` before context compaction.

## Troubleshooting

### Build Issues
```bash
rm -rf packages/app-builder/build
cd packages/app-builder && bun run build
```
