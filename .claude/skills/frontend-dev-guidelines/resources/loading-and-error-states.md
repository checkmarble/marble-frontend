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
    .with('open', () => 'text-yellow-100')
    .with('investigating', () => 'text-purple-100')
    .with('closed', () => 'text-green-100')
    .with('discarded', () => 'text-grey-50')
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
        <div className="animate-pulse bg-grey-100 h-8 w-48 rounded" />
        <div className="animate-pulse bg-grey-100 h-4 w-full rounded" />
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
<Button disabled={isPending}>
  {isPending ? 'Saving...' : 'Save'}
</Button>
```

---

## Error Handling

### Toast Notifications - Server Side Only

**Important**: Toast notifications must be managed by the server (BFF) using `toastSessionService`, NOT from frontend components.

**Toast message formats:**
- **`message:`** (recommended) - Pre-translated string using `t('...')`
- **`messageKey:`** (deprecated) - Limited predefined keys only

```typescript
// ❌ BAD - Frontend toast (DO NOT USE)
import toast from 'react-hot-toast';

const handleSave = async () => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Saved!');  // Don't do this!
  } catch {
    toast.error('Error!');    // Don't do this!
  }
};

// ✅ GOOD - Server-side toast in BFF route
// routes/ressources+/cases+/update-something.tsx
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function myAction({ request, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const [t, toastSession] = await Promise.all([
      i18nextService.getFixedT(request, ['cases', 'common']),
      toastSessionService.getSession(request),
    ]);

    try {
      // ... perform action
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

// ✅ GOOD - Frontend just calls mutation without toast handling
const handleSave = () => {
  mutation.mutate(data, { onSuccess: closePanel });
};
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
