# Data Fetching Patterns

Data fetching using TanStack Query with the repository pattern.

---

## Architecture Overview

```
Route (loader) -> Query Hook -> Repository -> API
```

- **Routes**: Use loaders for SSR data, queries for client-side
- **Query Hooks**: Located in `queries/{domain}/`
- **Repositories**: Located in `repositories/`
- **Models**: Types and adapters in `models/`

---

## Query Hooks

### Location

```
packages/app-builder/src/queries/
  cases/
    get-cases.ts
    get-case.ts
    create-case.ts
    edit-assignee.ts
  decisions/
    get-decisions.ts
  analytics/
    ...
```

### Basic Query Pattern

```typescript
// queries/cases/get-case.ts
import { type CaseDetail } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export const useGetCaseQuery = (caseId: string) => {
  return useQuery({
    queryKey: ['cases', 'get-case', caseId],
    queryFn: async () => {
      const response = await fetch(
        getRoute('/ressources/cases/:caseId', { caseId })
      );
      return response.json() as Promise<CaseDetail>;
    },
    enabled: !!caseId,
  });
};
```

### Infinite Query Pattern

```typescript
// queries/cases/get-cases.ts
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import QueryString from 'qs';

export const useGetCasesQuery = (
  inboxId: string,
  filters: Filters | undefined,
  limit: number,
) => {
  return useInfiniteQuery({
    queryKey: ['cases', 'get-cases', inboxId, filters, limit],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { ...filters, offsetId: pageParam, limit },
        { skipNulls: true, addQueryPrefix: true }
      );
      const response = await fetch(endpoint(inboxId, qs));
      return response.json() as Promise<PaginatedResponse<Case>>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) => {
      return page?.hasNextPage
        ? page.items[page.items.length - 1]?.id
        : null;
    },
    placeholderData: keepPreviousData,
  });
};
```

---

## Mutations

### Basic Mutation Pattern

```typescript
// queries/cases/edit-name.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useEditCaseNameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, name }: { caseId: string; name: string }) => {
      const response = await fetch(
        getRoute('/ressources/cases/:caseId/name', { caseId }),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }
      );
      return response.json();
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['cases', 'get-case', caseId] });
      toast.success('Case name updated');
    },
    onError: () => {
      toast.error('Failed to update case name');
    },
  });
};
```

### Usage in Component

```typescript
export const EditCaseName: FunctionComponent<{ caseId: string }> = ({ caseId }) => {
  const editName = useEditCaseNameMutation();

  const handleSubmit = (name: string) => {
    editName.mutate({ caseId, name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" />
      <Button type="submit" disabled={editName.isPending}>
        {editName.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
```

---

## Repository Pattern

### Repository Interface

```typescript
// repositories/CaseRepository.ts
export interface CaseRepository {
  listCases(args: CaseFiltersWithPagination): Promise<PaginatedResponse<Case>>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: { caseId: string; body: CaseUpdateBody }): Promise<CaseDetail>;
  // ...
}
```

### Repository Implementation

Repositories are initialized in `init.server.ts` and `init.client.ts`.

---

## Model Adapters

### Adapter Pattern

```typescript
// models/cases.ts
export interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  createdAt: Date;
}

// Adapt API response to typed model
export function adaptCase(dto: CaseDto): Case {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status as CaseStatus,
    createdAt: new Date(dto.created_at),
  };
}
```

---

## Query Keys Convention

```typescript
// List queries
['cases', 'get-cases', inboxId, filters]
['decisions', 'list', scenarioId]

// Single entity
['cases', 'get-case', caseId]
['decisions', 'get', decisionId]

// Related data
['cases', caseId, 'events']
['cases', caseId, 'decisions']
```

---

## Loaders (SSR)

For server-side data fetching, use `createServerFn` with middleware:

```typescript
// routes/_builder+/cases+/overview.tsx
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async function casesOverviewLoader({ context }) {
  const { user, entitlements, inbox: inboxRepository } = context.authInfo;

  const inboxes = await inboxRepository.listInboxes();

  return {
    currentUserId: user.actorIdentity.userId,
    inboxes,
    entitlements: {
      autoAssignment: entitlements.autoAssignment,
    },
  };
});

export default function CasesOverview() {
  const loaderData = useLoaderData<typeof loader>();
  return <OverviewPage {...loaderData} />;
}
```

### Key Points for Loaders

- Use `createServerFn` with middleware array (e.g., `[authMiddleware]`)
- Access repositories and user info via `context.authInfo`
- Return data directly from the loader function
- Use `useLoaderData<typeof loader>()` in components

---

## Actions (SSR)

For server-side mutations, use `createServerFn` with middleware and toast:

```typescript
// routes/ressources+/lists+/create.tsx
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { redirect } from '@remix-run/node';
import { z } from 'zod/v4';

type CreateListResourceActionResult = ServerFnResult<Response | { success: boolean; errors: any }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createListResourceAction({ request, context }): CreateListResourceActionResult {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const rawPayload = await request.json();

    const payload = createListPayloadSchema.safeParse(rawPayload);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      const result = await context.authInfo.customListsRepository.createCustomList(payload.data);
      return redirect(getRoute('/lists/:listId', { listId: fromUUIDtoSUUID(result.id) }));
    } catch (error) {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: isStatusConflictHttpError(error)
          ? 'common:errors.list.duplicate_list_name'
          : 'common:errors.unknown',
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
```

### Key Points for Actions

- Use `createServerFn` with middleware array
- Common middleware: `authMiddleware`, `handleRedirectMiddleware`
- Access toast service via `context.services.toastSessionService`
- Use `setToastMessage()` for success/error toasts
- Return response with `Set-Cookie` header to commit toast session
- Use `data()` helper to attach headers to response

### Toast Message Pattern

```typescript
// Success toast
setToastMessage(toastSession, {
  type: 'success',
  messageKey: 'common:success.save',
});

// Error toast with i18n key
setToastMessage(toastSession, {
  type: 'error',
  messageKey: 'common:errors.unknown',
});

// Error toast with dynamic message
setToastMessage(toastSession, {
  type: 'error',
  message: t('common:errors.unknown'),
});
```

---

## Available Middleware

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | Authentication - provides `context.authInfo` with user, repositories |
| `handleRedirectMiddleware` | Handles redirects properly in server functions |

---

## Error Handling

### Client-side (TanStack Query)

```typescript
import toast from 'react-hot-toast';

const mutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onError: (error) => {
    toast.error('Operation failed');
    console.error('Mutation error:', error);
  },
});
```

### Server-side (Actions)

```typescript
try {
  // operation
} catch (error) {
  setToastMessage(toastSession, {
    type: 'error',
    messageKey: isStatusConflictHttpError(error)
      ? 'common:errors.specific_error'
      : 'common:errors.unknown',
  });

  return data({ success: false, errors: [] }, [
    ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
  ]);
}
```

---

## Summary

- One query hook per file in `queries/{domain}/`
- Use `useQuery` for fetching, `useMutation` for updates
- Repository pattern abstracts API calls
- Model adapters for type-safe transformations
- **Loaders**: Use `createServerFn` with `authMiddleware`
- **Actions**: Use `createServerFn` with middleware + `setToastMessage` for feedback
- Client-side: `react-hot-toast` for user feedback
- Server-side: `setToastMessage` with toast session for user feedback
