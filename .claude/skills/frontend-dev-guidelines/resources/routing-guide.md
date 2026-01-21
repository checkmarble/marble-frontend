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

<Link to="/cases" className="text-purple-primary hover:underline">
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

## Resource Routes

API-like routes that return JSON:

```typescript
// routes/ressources+/cases.$caseId.tsx
export async function loader({ params, request }: LoaderFunctionArgs) {
  const caseData = await getCaseRepository(request).getCase({
    caseId: params.caseId!,
  });
  return Response.json({ data: caseData });
}
```

---

## Summary

- Remix flat routes with `+/` folders
- `$param` for dynamic routes
- Loaders for SSR data fetching
- Actions for form handling
- `handle.BreadCrumbs` for navigation
- Resource routes for client-side fetching
