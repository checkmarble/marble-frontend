---
name: frontend-dev-guidelines
description: Use when writing, editing, creating, planning, fixing, or refactoring any UI code in this project. Covers components, pages, routes, forms, tables, modals, buttons, queries, hooks, styles, layouts, loaders, and actions. Use when adding a feature, building a page, fixing a bug, styling UI, creating a modal, adding a table, writing a query, updating a route, or any work touching packages/app-builder or packages/ui-design-system.
---

# Frontend Development Guidelines

Comprehensive guide for React development in the Marble monorepo. All patterns below are derived from the actual codebase.

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Remix** (flat file routes with `+` folders)
- **Radix UI** (headless primitives)
- **Tailwind CSS 4** (CSS variable-based theming)
- **TanStack Query** (server state) + **TanStack Form** (form state)
- **Zod v4** (`import { z } from 'zod/v4'`)
- **ts-pattern** (pattern matching) + **remeda** (functional utils)
- **cn** (class composition with Tailwind merge, from ui-design-system)

---

## Monorepo Structure

```
packages/
  app-builder/         # Main Remix application
  ui-design-system/    # Reusable UI (Button, Modal, Table, MenuCommand)
  ui-icons/            # Icon components (SVG sprite)
  shared/              # Shared utilities
  marble-api/          # Generated API client
  tailwind-preset/     # Tailwind config + CSS variables
  typescript-utils/    # TS utilities
```

## App-Builder Architecture

```
packages/app-builder/src/
  routes/           # Remix flat routes (_builder+, _auth+, ressources+)
  components/       # Feature components (Cases/, Analytics/, AstBuilder/)
  queries/          # TanStack Query hooks (one file per query)
  repositories/     # Data access layer (interfaces + factory functions)
  services/         # Business logic
  models/           # Types + adapter functions (DTO <-> domain)
  hooks/            # Custom React hooks
  contexts/         # React contexts (AgnosticNavigation, etc.)
  schemas/          # Zod schemas
  utils/            # Utilities (routes/, form.ts, format.ts)
  locales/          # i18n (en/, fr/, ar/ - all three required)
  middlewares/      # Server middleware (auth, redirect)
```

---

## Core Conventions

### Components

```typescript
// Plain function declarations - NOT React.FC or FunctionComponent
// Named exports only - NO default exports
// Props via interface (or type)

interface CaseCardProps {
  caseData: Case;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CaseCard({ caseData, onSelect, className }: CaseCardProps) {
  return (
    <div className={cn('rounded-lg border border-grey-border p-4', className)}>
      <h3 className="text-l font-semibold text-grey-primary">{caseData.name}</h3>
      <Button onClick={() => onSelect?.(caseData.id)}>Select</Button>
    </div>
  );
}
```

### Imports

```typescript
// Internal (path alias)
import { Case } from '@app-builder/models/cases';
import { useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { getRoute } from '@app-builder/utils/routes';

// UI packages
import { Button, Modal, MenuCommand, Table, useVirtualTable, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

// External
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { match, P } from 'ts-pattern';
import * as R from 'remeda';
import toast from 'react-hot-toast';
// Note: prefer cn over clsx — cn resolves conflicting Tailwind classes
```

### Query Hook (one file per query)

```typescript
// queries/cases/get-case.ts
import { useQuery } from '@tanstack/react-query';
import { getRoute } from '@app-builder/utils/routes';

export function useGetCaseQuery(caseId: string) {
  return useQuery({
    queryKey: ['cases', 'get-case', caseId],
    queryFn: async () => {
      const response = await fetch(
        getRoute('/ressources/cases/:caseId', { caseId }),
      );
      return response.json() as Promise<CaseDetail>;
    },
    enabled: !!caseId,
  });
}
```

### Loaders (server-side data)

```typescript
// Using createServerFn with middleware (preferred for new code)
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn(
  [authMiddleware],
  async function casesLoader({ request, context }) {
    const inboxes = await context.authInfo.inbox.listInboxes();
    return { inboxes };
  },
);
```

---

## Topic Guides

Read these when working on specific areas:

| Topic | Resource | When to read |
|-------|----------|-------------|
| Component patterns | [component-patterns.md](resources/component-patterns.md) | Writing/editing components |
| Data fetching | [data-fetching.md](resources/data-fetching.md) | Queries, mutations, loaders, actions |
| Routing | [routing-guide.md](resources/routing-guide.md) | Routes, breadcrumbs, navigation |
| Styling | [styling-guide.md](resources/styling-guide.md) | Colors, surface tokens, dark mode |
| Tables & selects | [tables-and-selects.md](resources/tables-and-selects.md) | Virtual tables, MenuCommand dropdowns |
| Forms & modals | [forms-and-modals.md](resources/forms-and-modals.md) | TanStack Form, Modal, Panel |
| Common patterns | [common-patterns.md](resources/common-patterns.md) | ts-pattern, remeda, i18n, icons, toasts, dates |
| File organization | [file-organization.md](resources/file-organization.md) | Architecture layers, naming |
| TypeScript | [typescript-standards.md](resources/typescript-standards.md) | Types, Zod v4, model adapters |
