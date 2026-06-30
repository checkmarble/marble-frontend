# Data Fetching Patterns

Data fetching architecture in TanStack Start: route loaders, server functions, queries, mutations, and repositories.

---

## Architecture

```text
Route loader (createServerFn)        -> Repository -> API Client     (SSR data for page render)
Component -> Query Hook -> fetch(    -> server-fn (createServerFn)    -> Repository -> API Client
                              OR
                           resource route in routes/ressources/)
```

- **Route loaders**: server-side, inline `createServerFn` chains, passed via `createFileRoute({ loader })`, accessed in components via `Route.useLoaderData()`
- **Server functions** (`server-fns/{domain}.ts`): server-side handlers called from React Query (mutations, on-demand fetches)
- **Resource file routes** (`routes/ressources/...`): for downloads, streams, anything returning a raw `Response`
- **Repositories**: abstract API calls, transform DTOs with adapters

---

## Route Loaders

```typescript
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const casesLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user, entitlements, inbox: inboxRepository } = context.authInfo;
    const inboxes = await inboxRepository.listInboxesMetadata();

    return {
      currentUserId: user.actorIdentity.userId,
      inboxes,
      entitlements: { autoAssignment: entitlements.autoAssignment },
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/')({
  loader: () => casesLoader(),
  component: CasesPage,
});
```

Key points:
- Chain syntax: `createServerFn().middleware([...]).handler(async ({ context }) => {...})`
- `context.authInfo` provides authenticated user, repositories, entitlements
- `context.services` provides `authService`, `featureAccessService`, `i18nextService` (no `toastSessionService` — toasts are client-side)
- Need the raw request? `import { getRequest } from '@tanstack/react-start/server'` then call `getRequest()` inside the handler
- `authMiddleware` already handles auth redirects (throws `redirect()` from `@tanstack/react-router`) — no separate `handleRedirectMiddleware`

---

## Server Functions (mutations & on-demand fetches)

Server functions live in `packages/app-builder/src/server-fns/{domain}.ts` and are called by React Query hooks.

```typescript
// server-fns/lists.ts
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const createListPayloadSchema = z.object({ name: z.string().min(1) });

export const createListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createListPayloadSchema)
  .handler(async ({ context, data }) => {
    const result = await context.authInfo.customListsRepository.createCustomList(data);
    throw redirect({
      href: `/detection/lists/${fromUUIDtoSUUID(result.id)}`,
    });
  });
```

Key points:
- `.validator(schema)` validates `data` on the server before the handler runs; the handler receives `{ context, data }` where `data` is the parsed result
- `redirect()` from `@tanstack/react-router` is thrown (not returned) to trigger navigation
- `setResponseHeaders(new Headers({ ... }))` from `@tanstack/react-start/server` sets headers like `Set-Cookie` — there is no `data()` helper. Used for things like persisted preferences, **not** for toast flash sessions (those no longer exist)
- For error feedback, let the server function throw; surface the message client-side via the mutation's `onError` (see [common-patterns#toast-notifications](common-patterns.md#toast-notifications))
- Call from the client: `createListFn({ data: { name: 'My List' } })`

### Calling from React Query

```typescript
import { useMutation } from '@tanstack/react-query';
import { createListFn } from '@app-builder/server-fns/lists';

export function useCreateListMutation() {
  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: (payload: { name: string }) => createListFn({ data: payload }),
  });
}
```

---

## Query Hooks

One file per query in `queries/{domain}/`. Queries call server functions directly, or fetch from resource file routes for downloads.

### Basic Query (server function)

```typescript
// queries/scenarios/scenario-iteration-rules.ts
import { getScenarioIterationRulesFn } from '@app-builder/server-fns/scenarios';
import { useQuery } from '@tanstack/react-query';

export function useScenarioIterationRules(scenarioIterationId: string) {
  return useQuery({
    queryKey: ['scenario-iteration-rules', scenarioIterationId],
    queryFn: () => getScenarioIterationRulesFn({ data: { scenarioIterationId } }),
  });
}
```

### Infinite Query (cursor pagination)

```typescript
// queries/cases/get-cases.ts
import { getCasesFn } from '@app-builder/server-fns/cases';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';

export function useGetCasesQuery(
  inboxId: string,
  filters: Filters | undefined,
  limit: number,
  order: 'ASC' | 'DESC',
) {
  return useInfiniteQuery({
    queryKey: ['cases', 'get-cases', inboxId, filters, limit, order],
    queryFn: ({ pageParam }) =>
      getCasesFn({ data: { inboxId, filters, limit, order, offsetId: pageParam } }),
    initialPageParam: null as string | null,
    getNextPageParam: (page) =>
      page?.hasNextPage ? page.items[page.items.length - 1]?.id : null,
    placeholderData: keepPreviousData,
  });
}
```

---

## Mutations

Mutation hooks live in `queries/{domain}/`. They wrap a server function with `useMutation`, invalidate queries in `onSuccess`, and surface user feedback via `react-hot-toast` in `onSuccess` / `onError` (see [common-patterns#toast-notifications](common-patterns.md#toast-notifications)).

```typescript
// queries/cases/edit-name.ts
import { editCaseNameFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

export const editNamePayloadSchema = z.object({
  caseId: z.string(),
  name: z.string().min(1),
});
type EditNamePayload = z.infer<typeof editNamePayloadSchema>;

export function useEditNameMutation() {
  const editCaseName = useServerFn(editCaseNameFn);
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationKey: ['cases', 'edit-name'],
    mutationFn: (payload: EditNamePayload) => editCaseName({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success(t('common:success.save'));
    },
    onError: (error) => {
      // Use error.message when the server function throws a typed/translated message
      // Fall back to a generic key for unexpected failures
      toast.error(error.message ?? t('common:errors.unknown'));
    },
  });
}
```

Key points:
- Wrap the server function with `useServerFn` so client-side middleware (request context, headers) runs correctly
- Invalidate the broadest relevant query prefix in `onSuccess` to refresh derived UI
- For error messages with i18n keys, throw a translated string from the server function and re-display it client-side, or branch on the error in `onError` to pick a specific i18n key

### Mutation with Navigation

```typescript
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';

export function useCreateScenarioMutation() {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: (data: CreateScenarioPayload) => createScenarioFn({ data }),
    onSuccess: (result) => {
      if (result?.redirectTo) navigate(result.redirectTo);
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
| `authMiddleware` | Auth check, redirects to `/sign-in` on failure; provides `context.authInfo` (user, repositories, entitlements) |
| `servicesMiddleware` | Provides `context.services` (authService, featureAccessService, i18nextService) and `context.appConfig` |
| `caseDetailMiddleware` | Adds case-detail context for case-scoped server functions |

Compose middleware via the chain: `createServerFn().middleware([servicesMiddleware, authMiddleware]).handler(...)`. `authMiddleware` already includes `servicesMiddleware` internally, so most handlers only need `[authMiddleware]`.
