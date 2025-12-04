---
name: frontend-dev-guidelines
description: Frontend development guidelines for the Marble monorepo with React/TypeScript, Radix UI, Tailwind CSS, TanStack Query, and Remix. Modern patterns including layered architecture, lazy loading, file organization, performance optimization, and TypeScript best practices.
---

# Frontend Development Guidelines

## Purpose

Comprehensive guide for modern React development in the Marble monorepo, emphasizing layered architecture, proper file organization, and performance optimization.

## Monorepo Structure

```
packages/
  app-builder/         # Main Remix application
  ui-design-system/    # Reusable UI components (Button, Modal, Select, etc.)
  ui-icons/            # Icon components
  shared/              # Shared utilities
  marble-api/          # API client
  tailwind-preset/     # Tailwind configuration
  typescript-utils/    # TS utilities
```

## Tech Stack

- **React 18** - UI library
- **Remix** - Full-stack web framework
- **Radix UI** - Headless UI primitives
- **Tailwind CSS 4** - Utility-first CSS
- **TanStack Query** - Async state management
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **clsx** - Conditional class composition

---

## App-Builder Architecture

```
packages/app-builder/src/
  components/        # App-specific UI components
  queries/           # TanStack Query hooks (one file per query)
  repositories/      # Data access layer (interfaces + implementations)
  services/          # Business logic services
  models/            # Data models with adapters
  routes/            # Remix routes (flat structure with + folders)
  hooks/             # Custom React hooks
  contexts/          # React contexts
  schemas/           # Zod schemas
  utils/             # Utility functions
  types/             # TypeScript types
  constants/         # Constants
```

### Layer Responsibilities

| Layer | Purpose | Example |
|-------|---------|---------|
| **routes/** | Remix routes, loaders, actions | `_app.cases._index.tsx` |
| **components/** | UI components | `Cases/CaseDetails.tsx` |
| **queries/** | TanStack Query hooks | `cases/get-cases.ts` |
| **repositories/** | API calls, data access | `CaseRepository.ts` |
| **services/** | Business logic | `CaseService.ts` |
| **models/** | Types + adapters | `cases.ts` |

---

## Quick Start

### New Component Checklist

- [ ] Use `React.FC<Props>` pattern with TypeScript
- [ ] Import from `ui-design-system` for reusable UI
- [ ] Tailwind CSS for styling with `clsx` for conditionals
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Default export at bottom

### New Query Checklist

- [ ] Create file in `queries/{domain}/` (e.g., `queries/cases/get-case.ts`)
- [ ] Define query key following convention: `['domain', 'action', ...params]`
- [ ] Export custom hook: `useGetCaseQuery`
- [ ] Use repository methods for API calls

### New Route Checklist

- [ ] Create file in `routes/` following Remix flat routes
- [ ] Define `handle` for breadcrumbs
- [ ] Create loader for data fetching
- [ ] Export default component

---

## Import Patterns

```typescript
// Path aliases
import { Case } from '@app-builder/models/cases';
import { CaseRepository } from '@app-builder/repositories/CaseRepository';
import { useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { getRoute } from '@app-builder/utils/routes';

// UI Design System
import { Button } from 'ui-design-system';
import { Modal } from 'ui-design-system';

// Remix
import { useLoaderData, useNavigate, Link } from '@remix-run/react';

// TanStack Query
import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';

// Styling
import clsx from 'clsx';
```

---

## Topic Guides

### Component Patterns

**[Complete Guide: resources/component-patterns.md](resources/component-patterns.md)**

- Use `ui-design-system` components (Button, Modal, Select)
- Compose with Tailwind CSS + `clsx` for conditional classes
- **Use ternary `? :` for conditional rendering** (never `&&`)

### Data Fetching

**[Complete Guide: resources/data-fetching.md](resources/data-fetching.md)**

- Queries in `queries/{domain}/`
- Repository pattern for API calls
- Models with adapters for type safety

### File Organization

**[Complete Guide: resources/file-organization.md](resources/file-organization.md)**

- Layered architecture
- One query per file
- Repository interfaces

### Styling

**[Complete Guide: resources/styling-guide.md](resources/styling-guide.md)**

- Tailwind CSS utility classes
- `clsx` for conditionals
- `ui-design-system` components

### Routing

**[Complete Guide: resources/routing-guide.md](resources/routing-guide.md)**

- Remix flat routes with `+` folders
- **Use `createServerFn` with middleware system** for loaders/actions
- `handle` for breadcrumbs

### Loading & Error States

**[Complete Guide: resources/loading-and-error-states.md](resources/loading-and-error-states.md)**

- Use `ts-pattern` for query state matching
- **Server-side toasts via `toastSessionService`** (never frontend toasts)

### Performance

**[Complete Guide: resources/performance.md](resources/performance.md)**

- `useMemo`, `useCallback`, `React.memo`
- Debounced search

### TypeScript

**[Complete Guide: resources/typescript-standards.md](resources/typescript-standards.md)**

- Strict mode, no `any`
- Model adapters for API responses

---

## Core Principles

1. **Layered Architecture**: routes -> components -> queries -> repositories
2. **One Query Per File**: `queries/cases/get-case.ts`
3. **Repository Pattern**: Abstract API calls behind interfaces
4. **Model Adapters**: Transform API responses to typed models
5. **ui-design-system**: Use shared components
6. **Tailwind CSS**: Utility-first with clsx
7. **Server-side Toasts**: Manage toasts via `toastSessionService` in BFF, never from frontend
8. **Ternary Conditional Rendering**: Use `{x ? (...) : null}` not `{x && (...)}`
9. **Middleware System**: Use `createServerFn` with middlewares for all loaders/actions

---

## Modern Component Template

```typescript
import { type FunctionComponent } from 'react';
import { Button } from 'ui-design-system';
import clsx from 'clsx';
import type { Case } from '@app-builder/models/cases';

interface CaseCardProps {
  caseData: Case;
  onSelect?: (id: string) => void;
  className?: string;
}

export const CaseCard: FunctionComponent<CaseCardProps> = ({
  caseData,
  onSelect,
  className,
}) => {
  const handleSelect = () => {
    onSelect?.(caseData.id);
  };

  return (
    <div
      className={clsx(
        'rounded-lg border border-grey-100 p-4',
        'hover:border-purple-100 transition-colors',
        className,
      )}
    >
      <h3 className="text-l font-semibold text-grey-100">{caseData.name}</h3>
      <p className="text-s text-grey-50">{caseData.status}</p>
      {onSelect ? <Button onClick={handleSelect}>Select</Button> : null}
    </div>
  );
};

export default CaseCard;
```

---

## Query Template

```typescript
// queries/cases/get-case.ts
import { type Case } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export const useGetCaseQuery = (caseId: string) => {
  return useQuery({
    queryKey: ['cases', 'get-case', caseId],
    queryFn: async () => {
      const response = await fetch(
        getRoute('/ressources/cases/:caseId', { caseId })
      );
      const data = await response.json();
      return data as Case;
    },
    enabled: !!caseId,
  });
};
```

---

## Route Template

```typescript
// routes/_app.cases.$caseId.tsx
import { useLoaderData } from '@remix-run/react';
import { CaseDetails } from '@app-builder/components/Cases/CaseDetails';
import type { LoaderFunctionArgs } from '@remix-run/node';

export const handle = {
  BreadCrumbs: [
    ({ data }: { data: { case: Case } }) => (
      <span>{data.case.name}</span>
    ),
  ],
};

export async function loader({ params }: LoaderFunctionArgs) {
  const caseId = params.caseId;
  // Load case data
  return { case: caseData };
}

export default function CasePage() {
  const { case: caseData } = useLoaderData<typeof loader>();
  return <CaseDetails caseData={caseData} />;
}
```

---

**Skill Status**: Adapted for Marble monorepo architecture
