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

For server-side data fetching in Remix routes:

```typescript
// routes/_app.cases.$caseId.tsx
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const caseId = params.caseId!;
  const repository = getCaseRepository(request);

  const caseData = await repository.getCase({ caseId });

  return { case: caseData };
}

export default function CasePage() {
  const { case: caseData } = useLoaderData<typeof loader>();
  return <CaseDetails caseData={caseData} />;
}
```

---

## Error Handling

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

---

## Summary

- One query hook per file in `queries/{domain}/`
- Use `useQuery` for fetching, `useMutation` for updates
- Repository pattern abstracts API calls
- Model adapters for type-safe transformations
- `react-hot-toast` for user feedback
