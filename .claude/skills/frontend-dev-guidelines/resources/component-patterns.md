# Component Patterns

Modern React component architecture for the Marble monorepo.

---

## Component Sources

### ui-design-system Components

For reusable UI primitives, import from `ui-design-system`:

```typescript
import { Button } from 'ui-design-system';
import { Modal } from 'ui-design-system';
import { Select } from 'ui-design-system';
import { Input } from 'ui-design-system';
import { Table } from 'ui-design-system';
import { Tabs } from 'ui-design-system';
import { Tag } from 'ui-design-system';
import { Tooltip } from 'ui-design-system';
```

### App-Specific Components

Located in `packages/app-builder/src/components/`:

```
components/
  Cases/
    CaseDetails.tsx
    CaseEvents.tsx
    CaseStatus.tsx
  Analytics/
    DecisionsScoreDistribution.tsx
  AstBuilder/
    Operand.tsx
    Root.tsx
  Auth/
    SignInWithGoogle.tsx
```

---

## Component Structure

### Basic Pattern

```typescript
import { type FunctionComponent } from 'react';
import clsx from 'clsx';

interface MyComponentProps {
  /** The item ID to display */
  itemId: string;
  /** Optional callback when action occurs */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const MyComponent: FunctionComponent<MyComponentProps> = ({
  itemId,
  onAction,
  className,
}) => {
  return (
    <div className={clsx('p-4', className)}>
      Item: {itemId}
    </div>
  );
};

export default MyComponent;
```

---

## Styling with Tailwind + clsx

### Basic Usage

```typescript
<div className="flex items-center gap-4 p-2">
  Content
</div>
```

### Conditional Classes

```typescript
import clsx from 'clsx';

<div
  className={clsx(
    'rounded-lg border p-4',
    'transition-colors',
    {
      'border-purple-100 bg-purple-98': isActive,
      'border-grey-100 bg-grey-100': !isActive,
    },
  )}
>
  Content
</div>
```

### With Props

```typescript
interface CardProps {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Card: FunctionComponent<CardProps> = ({
  variant = 'primary',
  className,
  children,
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg p-4',
        {
          'bg-purple-100 text-grey-00': variant === 'primary',
          'bg-grey-100 text-grey-100': variant === 'secondary',
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
```

---

## Using Radix UI Primitives

When `ui-design-system` doesn't have what you need, use Radix directly:

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
```

### Example: Custom Dialog

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from 'ui-design-system';

export const ConfirmDialog: FunctionComponent<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}> = ({ open, onOpenChange, onConfirm }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-grey-100/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-grey-00 p-6">
          <Dialog.Title className="text-l font-semibold">
            Confirm Action
          </Dialog.Title>
          <Dialog.Description className="text-s text-grey-50 mt-2">
            Are you sure you want to proceed?
          </Dialog.Description>
          <div className="mt-4 flex gap-2 justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button onClick={onConfirm}>Confirm</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

---

## Lazy Loading

### When to Lazy Load

- Heavy components (charts, editors)
- Route-level components
- Modal content not shown initially

### Pattern

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

export const Dashboard: FunctionComponent = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div className="animate-pulse h-64 bg-grey-100" />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
```

---

## Component Communication

### Props Down, Events Up

```typescript
// Parent
const Parent: FunctionComponent = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Child
      items={items}
      onSelect={setSelectedId}
    />
  );
};

// Child
interface ChildProps {
  items: Item[];
  onSelect: (id: string) => void;
}

export const Child: FunctionComponent<ChildProps> = ({ items, onSelect }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

---

## Conditional Rendering - Always Use Ternary

**Never** use short-circuit `&&` for conditional rendering. Always use ternary `? :` to avoid leaked rendering issues (e.g., rendering `0` or `false`).

```typescript
// ❌ BAD - Short-circuit (DO NOT USE)
{isVisible && <Component />}
{items.length && <List items={items} />}  // Leaks 0 if items.length is 0
{hasPermission && <AdminPanel />}

// ✅ GOOD - Ternary with explicit null
{isVisible ? <Component /> : null}
{items.length > 0 ? <List items={items} /> : null}
{hasPermission ? <AdminPanel /> : null}

// ✅ GOOD - Combining multiple conditions
{isExpanded && hasUsers ? (
  <div className="flex flex-col gap-v2-sm">
    {users.map((user) => (
      <UserRow key={user.id} user={user} />
    ))}
  </div>
) : null}
```

Reference: https://www.eslint-react.xyz/docs/rules/no-leaked-conditional-rendering

---

## Summary

- Use `ui-design-system` for reusable components
- Tailwind CSS + `clsx` for styling
- `FunctionComponent` type for components
- Radix UI for custom primitives
- Lazy load heavy components
- **Always use ternary `? :` for conditional rendering, never `&&`**
