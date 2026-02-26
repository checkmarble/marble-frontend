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

### In Route Handles

Declare namespaces in `handle.i18n`:

```typescript
export const handle = {
  i18n: ['common', 'cases', 'navigation'] satisfies Namespace,
};
```

### Server-Side Translation

```typescript
const { i18nextService: { getFixedT } } = context.services;
const t = await getFixedT(request, ['common', 'data']);

setToastMessage(session, {
  type: 'success',
  message: t('data:apply_archetype.success'),
});
```

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

### Client-Side (react-hot-toast)

```typescript
import toast from 'react-hot-toast';

toast.success('Case created successfully');
toast.error('Failed to create case');
toast.error(t('common:errors.unknown'));
```

### Server-Side (session flash)

Used in actions to show toasts after redirect:

```typescript
import { setToastMessage } from '@app-builder/components/MarbleToaster';

// With i18n key (preferred)
setToastMessage(toastSession, {
  type: 'success',
  messageKey: 'common:success.save',
});

// With direct message
setToastMessage(toastSession, {
  type: 'error',
  message: t('common:errors.unknown'),
});

// Return with Set-Cookie header to persist toast
return data({ success: false, errors: [] }, [
  ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
]);
```

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
