# Component Patterns

Actual component patterns used in the Marble codebase.

---

## Component Declaration

Use **plain function declarations** with **named exports**. Never use `React.FC`, `FunctionComponent`, or default exports.

```typescript
// Correct
export function CaseCard({ caseData, onSelect, className }: CaseCardProps) {
  return <div>...</div>;
}

// Wrong - don't use these
export const CaseCard: React.FC<Props> = () => {};
export const CaseCard: FunctionComponent<Props> = () => {};
export default CaseCard;
```

---

## Props Definition

Use `interface` or `type` - both are acceptable. Place before the component.

```typescript
interface CaseCardProps {
  caseData: Case;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CaseCard({ caseData, onSelect, className }: CaseCardProps) {
  // ...
}
```

---

## Class Composition: cn (preferred) and clsx

**Prefer `cn`** from ui-design-system — it wraps `tailwind-merge` so conflicting Tailwind classes resolve correctly (e.g., `cn('p-2', 'p-4')` yields `p-4`). `clsx` only concatenates strings and won't resolve conflicts.

```typescript
import { cn } from 'ui-design-system';

// Basic composition (most common)
className={cn('rounded-lg border p-4', className)}

// Conditional with ternary
className={cn('border-grey-border col-span-5 w-2 border-e', isFirst ? 'h-4' : 'h-2')}

// Object syntax for conditionals
className={cn('flex flex-row gap-6 select-none', {
  'opacity-50': disabled,
  'pointer-events-none': disabled,
})}
```

---

## ui-design-system Imports

Import individual components:

```typescript
import { Button, cn } from 'ui-design-system';
import { Modal } from 'ui-design-system';
import { Table, useVirtualTable } from 'ui-design-system';
import { MenuCommand } from 'ui-design-system';
import { TooltipV2 } from 'ui-design-system';
```

Key components: `Button`, `Modal`, `Table`, `MenuCommand`, `Tag`, `Tabs`, `TooltipV2`, `Input`.

**Deprecated**: `Select`, `SelectWithCombobox` - use `MenuCommand` instead.

---

## Compound Components

Group related components into a namespace object:

```typescript
function Root({ children, onOpenChange }: RootProps) { /* ... */ }
function Trigger({ children }: TriggerProps) { /* ... */ }
function Content({ children }: ContentProps) { /* ... */ }

export const AiAssist = { Root, Trigger, Content };
```

Usage: `<AiAssist.Root>`, `<AiAssist.Trigger>`, `<AiAssist.Content>`.

---

## Memoized Components

Use `memo()` for expensive components. Set `displayName`:

```typescript
import { memo } from 'react';

export const EditionAstBuilderNode = memo(function EditionAstBuilderNode(props: {
  root?: boolean;
  path: string;
}) {
  // expensive rendering...
});
EditionAstBuilderNode.displayName = 'EditionAstBuilderNode';
```

---

## forwardRef (ui-design-system)

Components wrapping HTML elements use `forwardRef`:

```typescript
import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(CtaV2ClassName({ variant }), className)}
        {...props}
      />
    );
  },
);
```

---

## CVA (class-variance-authority)

ui-design-system uses CVA for variant-based styling:

```typescript
import { cva } from 'class-variance-authority';

export const CtaV2ClassName = cva(
  'text-default font-medium w-fit rounded-v2-md inline-flex items-center gap-v2-xs cursor-pointer',
  {
    variants: {
      variant: { primary: '...', secondary: '...' },
      size: { small: '...', medium: '...' },
    },
    defaultVariants: { variant: 'primary', size: 'small' },
  },
);
```

---

## Summary

1. **Plain function declarations** - no `React.FC` or `FunctionComponent`
2. **Named exports only** - no default exports
3. **`cn`** from ui-design-system for class composition (resolves Tailwind conflicts)
4. **Individual imports** from ui-design-system
5. **Compound components** for related UI groups
6. **`memo()`** for expensive components with `displayName`
7. **CVA** for variant-based styling in ui-design-system
