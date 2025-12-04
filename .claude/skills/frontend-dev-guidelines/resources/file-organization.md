# File Organization

Layered architecture for the Marble app-builder.

---

## Monorepo Structure

```
packages/
  app-builder/           # Main Remix application
  ui-design-system/      # Reusable UI components
  ui-icons/              # Icon components
  shared/                # Shared utilities
  marble-api/            # API client types
  tailwind-preset/       # Tailwind configuration
  typescript-utils/      # TS utilities
  tests/                 # E2E tests
```

---

## App-Builder Architecture

```
packages/app-builder/src/
  components/        # App-specific UI components
  queries/           # TanStack Query hooks
  repositories/      # Data access layer
  services/          # Business logic
  models/            # Data models + adapters
  routes/            # Remix routes
  hooks/             # Custom React hooks
  contexts/          # React contexts
  schemas/           # Zod schemas
  utils/             # Utilities
  types/             # TypeScript types
  constants/         # Constants
  locales/           # i18n translations
  infra/             # Infrastructure code
  middlewares/       # Remix middlewares
```

---

## Layer Responsibilities

### routes/

Remix file-based routes with loaders and actions.

```
routes/
  _app.cases._index.tsx      # /cases
  _app.cases.$caseId.tsx     # /cases/:caseId
  _auth+/                    # Auth routes
  _builder+/                 # Builder routes
  ressources+/               # Resource routes (API-like)
```

### components/

App-specific UI components organized by domain.

```
components/
  Cases/
    CaseDetails.tsx
    CaseEvents.tsx
    CaseStatus.tsx
    CreateCase.tsx
  Analytics/
    DecisionsScoreDistribution.tsx
  AstBuilder/
    Operand.tsx
    Root.tsx
  Auth/
    SignInWithGoogle.tsx
  Page.tsx                   # Layout component
  Breadcrumbs.tsx           # Navigation
  Callout.tsx               # Alert component
```

### queries/

TanStack Query hooks, one file per query.

```
queries/
  cases/
    get-cases.ts
    get-case.ts
    create-case.ts
    edit-assignee.ts
    edit-name.ts
  decisions/
    list-decisions.ts
  analytics/
    get-stats.ts
```

### repositories/

Data access layer with interfaces.

```
repositories/
  CaseRepository.ts
  DecisionRepository.ts
  AnalyticsRepository.ts
  init.server.ts            # Server-side init
  init.client.ts            # Client-side init
```

### models/

Data models with adapters for API transformations.

```
models/
  cases.ts                  # Case type + adaptCase()
  decision.ts               # Decision type + adaptDecision()
  pagination.ts             # Pagination helpers
```

### services/

Business logic services.

```
services/
  CaseService.ts
  DecisionService.ts
```

### hooks/

Custom React hooks.

```
hooks/
  useCurrentUser.ts
  useOrganization.ts
  usePendingState.ts
```

### contexts/

React contexts.

```
contexts/
  AgnosticNavigationContext.tsx
  CurrentOrganizationContext.tsx
```

---

## Import Aliases

```typescript
// @app-builder/* resolves to packages/app-builder/src/*
import { Case } from '@app-builder/models/cases';
import { useGetCaseQuery } from '@app-builder/queries/cases/get-case';
import { CaseRepository } from '@app-builder/repositories/CaseRepository';
```

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase.tsx | `CaseDetails.tsx` |
| Queries | kebab-case.ts | `get-cases.ts` |
| Repositories | PascalCase.ts | `CaseRepository.ts` |
| Models | kebab-case.ts | `cases.ts` |
| Hooks | camelCase.ts | `useCurrentUser.ts` |
| Routes | Remix convention | `_app.cases.$caseId.tsx` |

### Exports

```typescript
// Components - named + default
export const CaseDetails: FunctionComponent<Props> = () => { };
export default CaseDetails;

// Queries - named hook export
export const useGetCaseQuery = () => { };

// Models - named exports
export interface Case { }
export function adaptCase() { }
```

---

## When to Create Where

| Need | Location |
|------|----------|
| Reusable UI component | `packages/ui-design-system/` |
| App-specific component | `packages/app-builder/src/components/` |
| New query hook | `queries/{domain}/` |
| API call abstraction | `repositories/` |
| Business logic | `services/` |
| Data types + adapters | `models/` |
| Custom hook | `hooks/` |
| Global state | `contexts/` |
| Validation schema | `schemas/` |

---

## Summary

- Layered architecture: routes -> components -> queries -> repositories
- One query per file
- Models with adapters for API transformations
- `ui-design-system` for reusable components
- `@app-builder/` path alias for imports
