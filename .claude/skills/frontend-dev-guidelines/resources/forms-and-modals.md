# Forms & Modals

TanStack Form, Modal dialogs, and Panel slide-outs.

---

## TanStack Form

Forms use `@tanstack/react-form` with Zod v4 validation and custom form components.

### Basic Form Pattern

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { Button, Modal } from 'ui-design-system';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
});

export function CreateItemForm({ closeModal }: { closeModal: () => void }) {
  const createMutation = useCreateItemMutation();

  const form = useForm({
    defaultValues: { name: '', description: '' },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createMutation.mutateAsync(value).then((res) => {
          if (res.success) closeModal();
        });
      }
    },
    validators: {
      onSubmit: schema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>Create Item</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <form.Field
          name="name"
          validators={{
            onBlur: schema.shape.name,
            onChange: schema.shape.name,
          }}
        >
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>Name</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button variant="secondary" appearance="stroked" type="button">Cancel</Button>
        </Modal.Close>
        <Button variant="primary" type="submit" disabled={createMutation.isPending}>Save</Button>
      </Modal.Footer>
    </form>
  );
}
```

### Form Utilities

```typescript
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';

// handleSubmit wraps form.handleSubmit with preventDefault
<form onSubmit={handleSubmit(form)}>

// getFieldErrors extracts error messages from TanStack Form error objects
<FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
```

### Form Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `FormInput` | `type`, `name`, `defaultValue`, `onChange`, `onBlur`, `valid` | Text/number input with error border |
| `FormLabel` | `name`, `valid` | Label linked to input via `htmlFor` |
| `FormErrorOrDescription` | `errors?`, `description?` | Shows errors or help text |
| `FormTextArea` | Same as FormInput | Multi-line input |
| `FormError` | `field`, `asString?`, `translations?` | Translates Zod error codes to i18n |

### Number Fields

For number fields, coerce the value in `handleChange`:

```typescript
<FormInput
  type="number"
  min={0}
  step={1}
  name={field.name}
  defaultValue={field.state.value}
  onChange={(e) => field.handleChange(+e.currentTarget.value)}
  onBlur={field.handleBlur}
  valid={field.state.meta.errors.length === 0}
/>
```

---

## Modal

Compound component built on Radix Dialog. Import from ui-design-system.

### Basic Modal

```typescript
import { useState } from 'react';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeleteConfirmModal({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary" color="red">
          <Icon icon="delete" className="size-5" />
          Delete
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Delete Item</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <p className="text-s text-center text-grey-primary">
            Are you sure you want to delete this item?
          </p>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked">Cancel</Button>
          </Modal.Close>
          <Button
            color="red"
            variant="primary"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            <Icon icon="delete" className="size-5" />
            Delete
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
```

### Modal Components

| Component | Purpose |
|-----------|---------|
| `Modal.Root` | Root state manager. Props: `open`, `onOpenChange` |
| `Modal.Trigger` | Opens the modal. Use `asChild` to wrap custom trigger |
| `Modal.Content` | Dialog container. Props: `size` (`small`/`medium`/`large`/`xlarge`) |
| `Modal.Title` | Dialog title (required for accessibility) |
| `Modal.Close` | Closes on click. Use `asChild` to wrap custom button |
| `Modal.Footer` | Sticky footer for action buttons |

### Modal with Form

Wrap `<form>` around `Modal.Title`, content, and `Modal.Footer`:

```typescript
<Modal.Content>
  <form onSubmit={handleSubmit(form)}>
    <Modal.Title>Create Item</Modal.Title>
    <div className="flex flex-col gap-6 p-6">
      {/* form fields */}
    </div>
    <Modal.Footer>
      <Modal.Close asChild>
        <Button variant="secondary" appearance="stroked" type="button">Cancel</Button>
      </Modal.Close>
      <Button variant="primary" type="submit">Save</Button>
    </Modal.Footer>
  </form>
</Modal.Content>
```

---

## Panel (Slide-out)

Right-side sliding panel for detail views. Import from app-builder components.

```typescript
import {
  PanelRoot,
  PanelContainer,
  PanelHeader,
  PanelContent,
  PanelFooter,
} from '@app-builder/components/Panel/Panel';

export function DetailPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="md">
        <PanelHeader>Detail View</PanelHeader>
        <PanelContent>
          {/* Scrollable content */}
        </PanelContent>
        <PanelFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </PanelFooter>
      </PanelContainer>
    </PanelRoot>
  );
}
```

### Panel Sizes

| Size | Max Width |
|------|-----------|
| `sm` | 24rem |
| `md` | 28rem |
| `lg` | 32rem |
| `xl` | 36rem |
| `xxl` | 42rem |
| `xxxl` | 48rem |
| `max` | 1000px |

Features: slide animation, focus trapping, Escape to close, portal rendering.
