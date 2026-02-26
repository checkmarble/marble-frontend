# Data Fetching Patterns

Data fetching architecture: loaders, actions, queries, mutations, and repositories.

---

## Architecture

```
Route loader/action -> Repository -> API Client
Component -> Query Hook -> fetch(resource route) -> Route loader -> Repository -> API Client
```

- **Loaders/Actions**: Server-side, access repositories via middleware context
- **Query Hooks**: Client-side, fetch from Remix resource routes (`ressources+/`)
- **Repositories**: Abstract API calls, transform DTOs with adapters

---

## Loaders

### With createServerFn + Middleware (preferred for new code)

```typescript
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn(
  [authMiddleware],
  async function casesLoader({ request, context }) {
    const { user, entitlements, inbox: inboxRepository } = context.authInfo;
    const inboxes = await inboxRepository.listInboxesMetadata();

    return {
      currentUserId: user.actorIdentity.userId,
      inboxes,
      entitlements: { autoAssignment: entitlements.autoAssignment },
    };
  },
);
```

Key points:
- `context.authInfo` provides authenticated user, repositories, entitlements
- `context.services` provides toastSessionService, i18nextService, etc.
- Middleware chain builds context: `[handleRedirectMiddleware, authMiddleware]`

### Plain Remix Loader (legacy pattern, still common)

```typescript
import { type LoaderFunctionArgs } from '@remix-run/node';
import { initServerServices } from '@app-builder/services/init.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxesMetadata();
  return Response.json(inboxes);
}
```

---

## Actions

### With createServerFn + Middleware + Toast

```typescript
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createListAction({ request, context }) {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const rawPayload = await request.json();

    const payload = createListPayloadSchema.safeParse(rawPayload);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      const result = await context.authInfo.customListsRepository.createCustomList(payload.data);
      return redirect(
        getRoute('/detection/lists/:listId', { listId: fromUUIDtoSUUID(result.id) }),
      );
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

Key points:
- `data(payload, headers)` returns data with custom headers (e.g., Set-Cookie)
- `setToastMessage()` flashes a toast into the session
- `z.treeifyError()` converts Zod errors to a structured tree
- Common middleware stack: `[handleRedirectMiddleware, authMiddleware]`

### Plain Remix Action (simpler cases)

```typescript
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, { failureRedirect: getRoute('/sign-in') }),
  ]);

  const { success, data, error } = editNamePayloadSchema.safeParse(raw);
  if (!success) return { success: false, errors: z.treeifyError(error) };

  await cases.updateCase({ caseId: data.caseId, body: { name: data.name } });
  return { success: true, errors: [] };
}
```

---

## Query Hooks

One file per query in `queries/{domain}/`. Queries fetch from resource routes.

### Basic Query

```typescript
// queries/scenarios/scenario-iteration-rules.ts
import { useQuery } from '@tanstack/react-query';
import { getRoute } from '@app-builder/utils/routes';

const endpoint = (id: string) =>
  getRoute('/ressources/scenarios/:scenarioIterationId/rules', { scenarioIterationId: id });

export function useScenarioIterationRules(scenarioIterationId: string) {
  return useQuery({
    queryKey: ['scenario-iteration-rules', scenarioIterationId],
    queryFn: async () => {
      const response = await fetch(endpoint(scenarioIterationId));
      return response.json() as Promise<{ rules: ScenarioIterationRule[] }>;
    },
  });
}
```

### Infinite Query (cursor pagination)

```typescript
// queries/cases/get-cases.ts
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';

export function useGetCasesQuery(
  inboxId: string,
  filters: Filters | undefined,
  limit: number,
  order: 'ASC' | 'DESC',
) {
  return useInfiniteQuery({
    queryKey: ['cases', 'get-cases', inboxId, filters, limit, order],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { ...filters, offsetId: pageParam, limit, order },
        { skipNulls: true, addQueryPrefix: true },
      );
      const response = await fetch(endpoint(inboxId, qs));
      return response.json() as Promise<PaginatedResponse<Case>>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) =>
      page?.hasNextPage ? page.items[page.items.length - 1]?.id : null,
    placeholderData: keepPreviousData,
  });
}
```

---

## Mutations

```typescript
// queries/cases/edit-name.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editNamePayloadSchema = z.object({
  caseId: z.string(),
  name: z.string().min(1),
});
type EditNamePayload = z.infer<typeof editNamePayloadSchema>;

export function useEditNameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-name'],
    mutationFn: async (payload: EditNamePayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}
```

### Mutation with Navigation

Some mutations redirect based on server response:

```typescript
export function useCreateScenarioMutation() {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (data: CreateScenarioPayload) => {
      const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }
      return result;
    },
  });
}
```

---

## Repository Pattern

Repositories abstract API calls and transform DTOs:

```typescript
// repositories/CaseRepository.ts
export interface CaseRepository {
  listCases(args: CaseFiltersWithPagination): Promise<PaginatedResponse<Case>>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: { caseId: string; body: CaseUpdateBody }): Promise<CaseDetail>;
}

// Factory function receives API client
export function makeGetCaseRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): CaseRepository => ({
    listCases: async ({ dateRange, inboxIds, statuses, ...rest }) => {
      const { items, ...pagination } = await marbleCoreApiClient.listCases({ /* ... */ });
      return {
        items: items.map(adaptCase),
        ...adaptPagination(pagination),
      };
    },
    // ...
  });
}
```

---

## Model Adapters

Transform API DTOs to domain models (see also [typescript-standards.md](typescript-standards.md)):

```typescript
// models/cases.ts
export interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  createdAt: string;
  contributors: CaseContributor[];
  tags: CaseTag[];
}

export const adaptCase = (dto: CaseDto): Case => ({
  id: dto.id,
  name: dto.name,
  status: dto.status,
  createdAt: dto.created_at,
  contributors: dto.contributors.map(adaptCaseContributor),
  tags: dto.tags.map(adaptCaseTag),
});
```

---

## Query Key Conventions

```typescript
// Domain-scoped, hierarchical
['cases', 'get-cases', inboxId, filters, limit]   // list
['cases', 'get-case', caseId]                       // single entity
['scenario-iteration-rules', scenarioIterationId]   // related data

// Invalidation: broad prefix invalidates all matching queries
queryClient.invalidateQueries({ queryKey: ['cases'] }); // all case queries
```

---

## Available Middleware

| Middleware | Purpose |
|-----------|---------|
| `authMiddleware` | Auth check, provides `context.authInfo` (user, repositories, entitlements) |
| `handleRedirectMiddleware` | Handles redirects in server functions |
| `servicesMiddleware` | Provides `context.services` (toast, i18n, auth session) |
