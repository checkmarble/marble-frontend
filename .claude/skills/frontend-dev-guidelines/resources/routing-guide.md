# Routing Guide

TanStack Router file-based routing patterns used in the Marble app. Routes are auto-discovered by the TanStack Router Vite plugin and types are generated into `routeTree.gen.ts`.

---

## Route Structure

```
packages/app-builder/src/routes/
├── __root.tsx                       # Root route (createRootRouteWithContext)
├── index.tsx                        # /
├── $.tsx                            # Catch-all (404)
├── _app.tsx                         # Authenticated app layout
├── _app/
│   ├── _builder.tsx                 # Main builder layout (sidebar, nav)
│   ├── _builder/
│   │   ├── cases.tsx                # /cases layout
│   │   ├── cases/
│   │   │   ├── index.tsx            # /cases
│   │   │   ├── $caseId.tsx          # /cases/:caseId
│   │   │   └── inboxes.$inboxId.tsx # /cases/inboxes/:inboxId
│   │   ├── detection.tsx            # /detection layout
│   │   ├── detection/
│   │   │   └── lists.tsx            # /detection/lists
│   │   ├── settings.tsx             # /settings layout
│   │   └── settings/
│   │       └── api-keys.tsx         # /settings/api-keys
│   ├── _auth.tsx                    # Auth layout
│   └── _auth/
│       ├── sign-in.tsx              # /sign-in
│       └── create-password.tsx      # /create-password
└── ressources/                      # Resource file routes (downloads, streams)
    ├── lists/
    │   └── download-csv-file.$listId.ts
    └── cases/
        └── download-file.$fileId.ts
```

Mutation endpoints called via React Query live in `packages/app-builder/src/server-fns/` (not in `routes/`). See [data-fetching.md](data-fetching.md).

## Naming Conventions

| Pattern | Meaning | Example |
|---------|---------|---------|
| `_name.tsx` | Layout route (renders `<Outlet />` for children) | `_app.tsx`, `_builder.tsx` |
| `$param` | Dynamic segment | `cases/$caseId.tsx` → `/cases/:caseId` |
| `parent/child.tsx` | Subdirectory nesting under a parent layout | `detection/lists.tsx` → `/detection/lists` |
| `dot.separated.tsx` | Combine static + dynamic segments in one filename | `cases/inboxes.$inboxId.tsx` → `/cases/inboxes/:inboxId` |
| `name_.tsx` (trailing underscore) | Break out of the parent layout while keeping the URL | `settings/webhooks_.$webhookId.tsx` |
| `index.tsx` | Index route at parent's path | `_app/_builder/index.tsx` |
| `$.tsx` | Catch-all splat route | `$.tsx` for 404 |
| `.server.ts` | Pure server utility (not a route, no `createFileRoute`) | `update-rule.server.ts` |
| `ressources/...` | Resource file routes (API-like, returns `Response`) | `ressources/lists/download-csv-file.$listId.ts` |

---

## Breadcrumbs

Routes declare breadcrumbs via `staticData.BreadCrumbs` inside `createFileRoute`:

```typescript
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_builder/cases')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        return (
          <BreadCrumbLink to="/cases" isLast={isLast}>
            <Icon icon="case-manager" className="me-2 size-6" />
            {t('navigation:case_manager')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: () => casesLayoutLoader(),
  component: CasesLayout,
});
```

Key points:
- `staticData.BreadCrumbs` is an array of React render functions
- Each receives `{ isLast: boolean }`
- The `Breadcrumbs` component walks the matched routes and collects each route's `staticData.BreadCrumbs`
- i18n namespaces are declared **per-component** via `useTranslation([...])` — no longer in a `handle` export

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
getRoute('/ressources/lists/download-csv-file/:listId', { listId })
```

### Link Component

```typescript
import { Link } from '@tanstack/react-router';

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

`useAgnosticNavigation` wraps TanStack Router's navigation hook and is preferred across the codebase for consistent SSR/CSR behavior.

---

## Route Template

```typescript
// routes/_app/_builder/cases.tsx
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

const casesLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { dataModelRepository } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    return { dataModel };
  });

export const Route = createFileRoute('/_app/_builder/cases')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        return (
          <BreadCrumbLink to="/cases" isLast={isLast}>
            <Icon icon="case-manager" className="me-2 size-6" />
            {t('navigation:case_manager')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: () => casesLayoutLoader(),
  component: CasesLayout,
});

function CasesLayout() {
  const { dataModel } = Route.useLoaderData();
  return (
    <DataModelContextProvider dataModel={dataModel}>
      <Outlet />
    </DataModelContextProvider>
  );
}
```

Key points:
- Loaders are defined as `createServerFn` chains and passed via the `loader` option
- `Route.useLoaderData()` reads loader data inside the component
- `authMiddleware` provides `context.authInfo` (repositories, user, entitlements) — no separate redirect middleware needed; auth redirects are handled inside `authMiddleware`

---

## Resource File Routes

For downloads, streams, or file-typed responses, use `createFileRoute(...)({ server: { handlers: { ... } } })`:

```typescript
// routes/ressources/lists/download-csv-file.$listId.ts
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/lists/download-csv-file/$listId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // ... auth, fetch, etc.
        const listId = fromParams(params, 'listId');
        return new Response(fileContents, {
          headers: {
            'Content-Disposition': `attachment; filename="list-${listId}.csv"`,
            'Content-Type': 'text/csv',
          },
        });
      },
    },
  },
});
```

For JSON endpoints called from React Query, use `server-fns/` instead (see [data-fetching.md](data-fetching.md)).
