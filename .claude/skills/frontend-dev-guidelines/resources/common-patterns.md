# Common Patterns

Frequently used patterns across the Marble codebase.

---

## ts-pattern (Pattern Matching)

Use `match` from `ts-pattern` for query state handling and discriminated unions:

### Query State Matching

```typescript
import { match } from 'ts-pattern';

{match(dataListQuery)
  .with({ isError: true }, () => (
    <div className="border-red-primary bg-red-background text-red-primary mt-3 rounded-sm border p-2">
      {t('common:global_error')}
    </div>
  ))
  .with({ isPending: true }, () => <LoadingSkeleton />)
  .otherwise((query) => (
    <DataTable data={query.data} />
  ))}
```

### Feature Access Matching

```typescript
import { match, P } from 'ts-pattern';

{match(featuresAccess.continuousScreening)
  .with(P.union('allowed', 'test'), () => (
    <SidebarLink
      labelTKey="navigation:continuous_screening"
      to={getRoute('/continuous-screening')}
      Icon={(props) => <Icon icon="scan-eye" {...props} />}
    />
  ))
  .otherwise(() => null)}
```

### Exhaustive Matching

```typescript
const getStatusColor = (status: CaseStatus) =>
  match(status)
    .with('open', () => 'text-yellow-primary')
    .with('investigating', () => 'text-purple-primary')
    .with('closed', () => 'text-green-primary')
    .with('discarded', () => 'text-grey-placeholder')
    .exhaustive();
```

---

## remeda (Functional Utils)

Import as namespace `R`:

```typescript
import * as R from 'remeda';

// Pipe-based data transformations
const fieldOptions = R.pipe(
  tableModel.fields,
  R.filter((field) => field.dataType === 'String'),
  R.filter((field) => field.name !== 'object_id'),
  R.map((field) => adaptFieldOption({ baseTableId: tableModel.id, field })),
);

// Common functions: pipe, filter, map, flatMap, entries, keys, isNonNullish, prop
const fulfilled = R.pipe(
  results,
  R.filter((r) => r.status === 'fulfilled'),
  R.map((r) => r.value),
);
```

---

## i18n (react-i18next)

Three locale directories (en, fr, ar) with multiple namespaces. Missing keys cause TS errors.

### In Components

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation(['common', 'cases']);

  return (
    <div>
      <h1>{t('cases:case.title')}</h1>
      <Button>{t('common:cancel')}</Button>
    </div>
  );
}
```

### Server-Side Translation

```typescript
const { i18nextService: { getFixedT } } = context.services;
const request = getRequest(); // from '@tanstack/react-start/server'
const t = await getFixedT(request, ['common', 'data']);

throw new Error(t('data:apply_archetype.error.invalid_payload'));
```

Use server-side `t` for messages embedded in thrown errors or returned data. Toasts themselves are surfaced client-side from mutation callbacks (see [Toast Notifications](#toast-notifications) below).

i18n namespaces no longer live in a `handle` export — each component just calls `useTranslation([...])` with the namespaces it needs. Server functions get the request via `getRequest()` to resolve the per-request `t`.

### Adding i18n Keys

Always update all three locale files:
- `locales/en/{namespace}.json`
- `locales/fr/{namespace}.json`
- `locales/ar/{namespace}.json`

---

## Icons (ui-icons)

SVG sprite-based icons with strongly-typed names:

```typescript
import { Icon } from 'ui-icons';

<Icon icon="delete" className="size-6 shrink-0" />
<Icon icon="plus" className="size-5" />
<Icon icon="category" className="text-purple-primary size-10" />
<Icon icon="case-manager" className="me-2 size-6" />
<Icon icon="scan-eye" className="size-5" />
```

Size with `size-{n}`, color via `text-{color}`.

---

## Toast Notifications

Toasts are **client-side only**, fired from React Query mutation callbacks (`onSuccess` / `onError`) or `mutateAsync().then(...).catch(...)`. There is no server-side flash session — server functions throw errors, the client decides what to show.

```typescript
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation(['common']);
const createMutation = useCreateTagMutation();

// In a form submit / handler:
createMutation
  .mutateAsync(value)
  .then(() => {
    toast.success(t('common:success.save'));
    onSuccess();
  })
  .catch(() => {
    toast.error(t('common:errors.unknown'));
  });

// Or via useMutation options:
useMutation({
  mutationFn: createTagFn,
  onSuccess: () => toast.success(t('common:success.save')),
  onError: () => toast.error(t('common:errors.unknown')),
});
```

For server-side errors that need to surface specific messages, throw a typed error from the server function and inspect it in the client `onError` handler.

---

## Date Formatting

### useFormatDateTime Hook (preferred)

```typescript
import { useFormatDateTime } from '@app-builder/utils/format';

const formatDateTime = useFormatDateTime();

// Format with Intl options
formatDateTime(timestamp, { dateStyle: 'short' })    // "2/24/26"
formatDateTime(timestamp, { timeStyle: 'short' })    // "2:30 PM"
formatDateTime(timestamp, { dateStyle: 'medium', timeStyle: 'short' })
```

### Direct date-fns (when needed)

```typescript
import { formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

formatDate(date, 'dd/MM/yyyy', { locale: fr })
```

### Other Format Utilities

Available from `@app-builder/utils/format`:
- `formatNumber(number, { language, style })`
- `formatCurrency(amount, { language, currency })`
- `formatPercentage(percentage, language)`
- `formatDuration(duration, language)`

---

## Route Helpers

```typescript
import { getRoute } from '@app-builder/utils/routes';

// Type-safe route building (TypeScript enforces required params)
getRoute('/cases')
getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(id) })
getRoute('/ressources/lists/create')
```

---

## Query Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Broad invalidation (invalidates all queries starting with prefix)
queryClient.invalidateQueries({ queryKey: ['cases'] });

// Specific invalidation
queryClient.invalidateQueries({ queryKey: ['cases', 'get-case', caseId] });
```
