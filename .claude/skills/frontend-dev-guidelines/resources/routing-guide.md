# Routing Guide

Remix file-based routing patterns.

---

## Route File Naming

Remix uses flat routes with special characters:

| Pattern | URL | Example File |
|---------|-----|--------------|
| `_app.cases._index.tsx` | `/cases` | Index route |
| `_app.cases.$caseId.tsx` | `/cases/:caseId` | Dynamic param |
| `_auth+/login.tsx` | `/login` | Auth layout |
| `ressources+/cases.tsx` | Resource route (API) |

### Special Characters

- `_layout` - Layout route (wraps children)
- `$param` - Dynamic parameter
- `+/` - Route folder
- `_index` - Index route

---

## Basic Route Structure

```typescript
// routes/_app.cases.$caseId.tsx
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { CaseDetails } from '@app-builder/components/Cases/CaseDetails';

// Breadcrumb configuration
export const handle = {
  BreadCrumbs: [
    ({ data }: { data: { case: Case } }) => (
      <span>{data.case.name}</span>
    ),
  ],
};

// Server-side data loading
export async function loader({ params, request }: LoaderFunctionArgs) {
  const caseId = params.caseId!;
  // Load data...
  return { case: caseData };
}

// Component
export default function CasePage() {
  const { case: caseData } = useLoaderData<typeof loader>();
  return <CaseDetails caseData={caseData} />;
}
```

---

## Loaders

Fetch data on the server:

```typescript
export async function loader({ params, request }: LoaderFunctionArgs) {
  const caseId = params.caseId!;
  const repository = getCaseRepository(request);

  const [caseData, events] = await Promise.all([
    repository.getCase({ caseId }),
    repository.getCaseEvents({ caseId }),
  ]);

  return { case: caseData, events };
}
```

---

## Actions

Handle form submissions:

```typescript
export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;

  const repository = getCaseRepository(request);
  await repository.updateCase({
    caseId: params.caseId!,
    body: { name },
  });

  return redirect(`/cases/${params.caseId}`);
}
```

---

## Navigation

### Link Component

```typescript
import { Link } from '@remix-run/react';

<Link to="/cases" className="text-purple-100 hover:underline">
  View Cases
</Link>

// With params
<Link to={`/cases/${caseId}`}>
  View Case
</Link>
```

### Programmatic Navigation

```typescript
import { useNavigate } from '@remix-run/react';

const navigate = useNavigate();

const handleClick = () => {
  navigate('/cases');
};

// With search params
navigate(`/cases?status=open`);
```

### Agnostic Navigation

The project has a custom navigation context for SSR compatibility:

```typescript
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';

const navigate = useAgnosticNavigation();
navigate('/cases');
```

---

## Breadcrumbs

Configure breadcrumbs via `handle`:

```typescript
export const handle = {
  BreadCrumbs: [
    // Static breadcrumb
    () => <span>Cases</span>,

    // Dynamic with data
    ({ data }: { data: { case: Case } }) => (
      <BreadCrumbLink to={`/cases/${data.case.id}`} isLast={false}>
        {data.case.name}
      </BreadCrumbLink>
    ),
  ],
};
```

---

## Resource Routes - Middleware System (Required)

**Always** use `createServerFn` with the middleware system for loaders and actions. Do not use the old `initServerServices` pattern.

```typescript
// ❌ BAD - Old pattern (DO NOT USE)
import { initServerServices } from '@app-builder/services/init.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  return Response.json({ data });
}

// ✅ GOOD - Middleware system
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

// Loader example
export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function myLoader({ context }) {
    const data = await context.authInfo.inbox.listInboxes();
    return { data };
  },
);

// Action example
export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function myAction({ request, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const [t, toastSession, rawData] = await Promise.all([
      i18nextService.getFixedT(request, ['cases', 'common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    // Validate payload
    const payload = myPayloadSchema.safeParse(rawData);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      // Perform action using context.authInfo
      await context.authInfo.inbox.updateInbox(payload.data.inboxId, {
        name: payload.data.name,
      });

      setToastMessage(toastSession, {
        type: 'success',
        message: t('cases:action.success'),  // Use `message:` with pre-translated string
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),  // Use `message:` with pre-translated string
      });

      return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    }
  },
);
```

---

## Summary

- Remix flat routes with `+/` folders
- `$param` for dynamic routes
- **Always use `createServerFn` with middleware system** for loaders and actions
- Access authenticated services via `context.authInfo`
- Toast notifications via `toastSessionService` in BFF
- `handle.BreadCrumbs` for navigation
