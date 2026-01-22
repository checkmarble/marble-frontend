# Loading & Error States

Proper loading and error handling patterns using ts-pattern.

---

## Pattern Matching with ts-pattern

Use `match` from `ts-pattern` for handling query states:

```typescript
import { match } from 'ts-pattern';
import { useQuery } from '@tanstack/react-query';

const { data, status, error } = useQuery({
  queryKey: ['cases', caseId],
  queryFn: () => fetchCase(caseId),
});

return match(status)
  .with('pending', () => <LoadingSkeleton />)
  .with('error', () => (
    <Callout variant="error">
      Failed to load: {error?.message}
    </Callout>
  ))
  .with('success', () => <CaseDetails data={data} />)
  .exhaustive();
```

---

## Matching Complex States

```typescript
import { match, P } from 'ts-pattern';

type QueryState<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const renderContent = (state: QueryState<Case>) =>
  match(state)
    .with({ isLoading: true }, () => <LoadingSkeleton />)
    .with({ isError: true, error: P.not(null) }, ({ error }) => (
      <ErrorDisplay error={error} />
    ))
    .with({ data: P.not(undefined) }, ({ data }) => (
      <CaseDetails data={data} />
    ))
    .otherwise(() => null);
```

---

## Matching Discriminated Unions

```typescript
import { match } from 'ts-pattern';

type CaseStatus = 'open' | 'investigating' | 'closed' | 'discarded';

const getStatusColor = (status: CaseStatus) =>
  match(status)
    .with('open', () => 'text-yellow-primary')
    .with('investigating', () => 'text-purple-primary')
    .with('closed', () => 'text-green-primary')
    .with('discarded', () => 'text-grey-placeholder')
    .exhaustive();

const getStatusLabel = (status: CaseStatus) =>
  match(status)
    .with('open', () => 'Open')
    .with('investigating', () => 'Under Investigation')
    .with('closed', () => 'Closed')
    .with('discarded', () => 'Discarded')
    .exhaustive();
```

---

## Loading Patterns

### Skeleton Loading

```typescript
<div className="space-y-4">
  {match(status)
    .with('pending', () => (
      <>
        <div className="animate-pulse bg-grey-background-light h-8 w-48 rounded" />
        <div className="animate-pulse bg-grey-background-light h-4 w-full rounded" />
      </>
    ))
    .with('success', () => (
      <>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
      </>
    ))
    .otherwise(() => null)}
</div>
```

### Button Loading State

```typescript
<ButtonV2 disabled={isPending}>
  {isPending ? 'Saving...' : 'Save'}
</ButtonV2>
```

---

## Error Handling

### Toast Notifications

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Case created successfully');

// Error
toast.error('Failed to create case');
```

### In Mutations

```typescript
const mutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onSuccess: () => {
    toast.success('Saved successfully');
  },
  onError: (error) => {
    toast.error('Failed to save');
  },
});
```

---

## Matching API Responses

```typescript
import { match, P } from 'ts-pattern';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const handleResponse = <T>(response: ApiResponse<T>) =>
  match(response)
    .with({ success: true }, ({ data }) => data)
    .with({ success: false }, ({ error }) => {
      toast.error(error);
      return null;
    })
    .exhaustive();
```

---

## Summary

- Use `ts-pattern` `match` for state handling
- `.exhaustive()` ensures all cases covered
- Pattern match query status: `pending`, `error`, `success`
- Use `P.not(null)` / `P.not(undefined)` for guards
- `react-hot-toast` for notifications
