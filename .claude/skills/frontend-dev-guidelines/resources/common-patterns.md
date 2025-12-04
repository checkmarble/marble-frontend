# Common Patterns

Frequently used patterns in the Marble codebase.

---

## Forms with TanStack Form + Zod

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { getFieldErrors } from '@app-builder/utils/form';
import { Button } from 'ui-design-system';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function MyForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        // Submit form
      }
    },
    validators: {
      onSubmit: schema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onBlur: schema.shape.name,
          onChange: schema.shape.name,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-2">
            <FormLabel name={field.name}>Name</FormLabel>
            <FormInput
              type="text"
              name={field.name}
              defaultValue={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              valid={field.state.meta.errors.length === 0}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## Modals with ui-design-system

```typescript
import { useState } from 'react';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteConfirmModal({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon icon="delete" className="size-6" />
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Delete Item</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <p className="text-center">Are you sure you want to delete this item?</p>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary">
                Cancel
              </Button>
            </Modal.Close>
            <Button
              color="red"
              className="flex-1"
              variant="primary"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              <Icon icon="delete" className="size-6" />
              Delete
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
```

---

## State Matching with ts-pattern

```typescript
import { match } from 'ts-pattern';

type ViewMode = 'list' | 'grid' | 'calendar';

const renderView = (mode: ViewMode, data: Item[]) =>
  match(mode)
    .with('list', () => <ListView items={data} />)
    .with('grid', () => <GridView items={data} />)
    .with('calendar', () => <CalendarView items={data} />)
    .exhaustive();
```

---

## Functional Utils with remeda

```typescript
import * as R from 'remeda';

// Or individual imports
import { filter, isTruthy, join, pipe } from 'remeda';

const processedItems = R.pipe(
  items,
  R.filter(item => item.active),
  R.sortBy(item => item.name),
  R.map(item => ({ ...item, label: item.name.toUpperCase() })),
);
```

---

## Date Handling with date-fns

```typescript
import { format, formatRelative, add, sub, differenceInDays } from 'date-fns';

// Format date
format(new Date(), 'MMM d, yyyy'); // "Nov 25, 2025"

// Relative time
formatRelative(date, new Date()); // "yesterday at 2:30 PM"

// Add/subtract time
add(new Date(), { days: 7 });
sub(new Date(), { months: 1 });

// Compare
differenceInDays(endDate, startDate);
```

---

## Icons from ui-icons

```typescript
import { Icon } from 'ui-icons';

<Icon icon="delete" className="size-6" />
<Icon icon="plus" className="size-6" />
<Icon icon="edit" className="size-6" />
```

---

## i18n with react-i18next

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation(['cases', 'common']);

  return (
    <div>
      <h1>{t('cases:case.title')}</h1>
      <Button>{t('common:cancel')}</Button>
    </div>
  );
}
```

---

## Toast Notifications

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Case created successfully');

// Error
toast.error('Failed to create case');

// With translation
toast.error(t('common:errors.unknown'));
```

---

## Route Helpers

```typescript
import { getRoute } from '@app-builder/utils/routes';

// Generate typed routes
const url = getRoute('/cases/:caseId', { caseId: '123' });
// "/cases/123"

const apiUrl = getRoute('/ressources/cases/:caseId/events', { caseId });
```

---

## Query Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After mutation success
queryClient.invalidateQueries({ queryKey: ['cases'] });
queryClient.invalidateQueries({ queryKey: ['cases', 'get-cases', inboxId] });
```

---

## Summary

- `@tanstack/react-form` + Zod for forms
- `Modal` from `ui-design-system` for dialogs
- `ts-pattern` for state matching
- `remeda` (as `R`) for functional operations
- `date-fns` for dates (individual imports)
- `Icon` from `ui-icons`
- `react-i18next` for translations
- `react-hot-toast` for notifications
