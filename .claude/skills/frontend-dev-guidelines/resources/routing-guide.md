# Routing Guide

Remix flat file routing patterns used in the Marble app.

---

## Route Structure

```
packages/app-builder/src/routes/
├── _index.tsx                          # Root redirect
├── _auth+/                             # Auth layout segment
│   ├── _layout.tsx                     # Auth layout wrapper
│   ├── sign-in.tsx                     # /sign-in
│   └── create-password.tsx             # /create-password
├── _builder+/                          # Main app layout segment
│   ├── _layout.tsx                     # App layout (sidebar, nav)
│   ├── cases+/                         # /cases
│   │   ├── _layout.tsx
│   │   ├── $caseId+/                   # /cases/:caseId
│   │   │   ├── _index.tsx
│   │   │   └── d+/$decisionId+/...    # Nested dynamic segments
│   │   └── overview.tsx
│   ├── detection+/                     # /detection
│   │   └── lists+/
│   │       ├── _index.tsx              # /detection/lists
│   │       └── $listId.tsx             # /detection/lists/:listId
│   └── settings+/                      # /settings
└── ressources+/                        # Server-only resource routes
    ├── cases+/
    │   ├── edit-name.tsx               # POST /ressources/cases/edit-name
    │   └── $caseId.next-unassigned.tsx
    ├── lists+/
    │   ├── create.tsx                  # POST /ressources/lists/create
    │   └── delete.tsx
    └── workflows+/
        └── rule+/$ruleId+/
            ├── rename.ts
            └── update-rule.server.ts   # Pure server utility (not a route)
```

## Naming Conventions

| Pattern | Meaning | Example |
|---------|---------|---------|
| `+/` | Segment folder (layout nesting) | `cases+/` |
| `_layout.tsx` | Layout component (wraps children with `<Outlet />`) | `_builder+/_layout.tsx` |
| `_index.tsx` | Index route (default child) | `cases+/_index.tsx` |
| `$param` | Dynamic segment | `$caseId+/` |
| `_prefix` | Pathless layout (groups routes without URL segment) | `_builder+/`, `_auth+/` |
| `.server.ts` | Pure server utility (not a route, no route exports) | `update-rule.server.ts` |
| `ressources+/` | Resource routes (API-like, no UI) | `ressources+/cases+/edit-name.tsx` |

---

## Breadcrumbs

Routes define breadcrumbs via the `handle` export:

```typescript
import { type BreadCrumbProps, BreadCrumbLink } from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
  ],
};
```

Key points:
- `handle.BreadCrumbs` is an array of React render functions
- Each receives `{ isLast: boolean; data: any }` (data = loader data)
- `handle.i18n` declares which namespaces the route needs
- The `Breadcrumbs` component uses `useMatches()` to collect all breadcrumbs from parent routes

---

## Navigation

### Type-safe Route Helper

```typescript
import { getRoute } from '@app-builder/utils/routes';

// No params
getRoute('/cases')

// With params (TypeScript enforces required params)
getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })
getRoute('/detection/lists/:listId', { listId: fromUUIDtoSUUID(id) })

// Resource routes
getRoute('/ressources/lists/create')
getRoute('/ressources/cases/:caseId/events', { caseId })
```

### Link Component

```typescript
import { Link } from '@remix-run/react';

<Link to={getRoute('/cases/:caseId', { caseId: id })}>
  View Case
</Link>
```

### Programmatic Navigation

```typescript
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';

const navigate = useAgnosticNavigation();
navigate(getRoute('/cases'));
navigate(result.redirectTo); // from server response
```

`useAgnosticNavigation` is preferred over Remix's `useNavigate` for SSR compatibility.

---

## Route Template

```typescript
// routes/_builder+/cases+/_index.tsx
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['common', 'cases'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          {t('navigation:cases')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn(
  [authMiddleware],
  async function casesLoader({ request, context }) {
    const inboxes = await context.authInfo.inbox.listInboxes();
    return { inboxes };
  },
);

export default function CasesPage() {
  const { inboxes } = useLoaderData<typeof loader>();
  const { t } = useTranslation(['cases']);

  return <CasesList inboxes={inboxes} />;
}
```

---

## Resource Routes

Server-only routes that return data (no UI component):

```typescript
// routes/ressources+/cases+/edit-name.tsx
export async function action({ request }: ActionFunctionArgs) {
  // ... validate and process
  return { success: true, errors: [] };
}

// No default export - this is a resource route
```

Client queries fetch from these routes via `fetch(getRoute('/ressources/...'))`.
