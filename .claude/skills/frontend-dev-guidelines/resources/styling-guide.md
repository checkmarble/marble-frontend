# Styling Guide

Tailwind CSS styling patterns for the Marble app-builder.

---

## Primary Method: Tailwind CSS

Use utility classes directly in JSX:

```typescript
<div className="flex items-center gap-4 p-2 rounded-lg border border-grey-100">
  Content
</div>
```

---

## Conditional Classes with clsx

```typescript
import clsx from 'clsx';

<div
  className={clsx(
    'rounded-lg border p-4 transition-colors',
    {
      'border-purple-100 bg-purple-98': isActive,
      'border-grey-100 hover:border-grey-50': !isActive,
    },
  )}
>
  Content
</div>
```

---

## Common Patterns

### Flexbox Layout

```typescript
// Row with gap
<div className="flex items-center gap-4">

// Column
<div className="flex flex-col gap-2">

// Space between
<div className="flex justify-between items-center">
```

### Spacing

```typescript
// Padding
className="p-4"      // all sides
className="px-4"     // horizontal
className="py-2"     // vertical
className="pt-4"     // top only

// Margin
className="m-4"
className="mt-2"
className="mb-4"
```

### Typography

```typescript
// Text sizes (project uses custom scale)
className="text-xs"   // extra small
className="text-s"    // small
className="text-m"    // medium
className="text-l"    // large
className="text-xl"   // extra large

// Colors
className="text-grey-100"    // dark text
className="text-grey-50"     // muted text
className="text-grey-00"     // light text
className="text-purple-100"  // accent
className="text-red-100"     // error
className="text-green-100"   // success
```

### Borders

```typescript
className="border border-grey-100 rounded-lg"
className="border-b border-grey-90"
```

---

## Color Palette

The project uses a custom color palette defined in `tailwind-preset`:

```
grey-00, grey-10, grey-50, grey-80, grey-90, grey-100
purple-98, purple-100, purple-110
red-100, red-110
green-100
yellow-100
```

---

## Using ui-design-system

For complex UI, use pre-built components:

```typescript
import { Button } from 'ui-design-system';
import { Modal } from 'ui-design-system';
import { Select } from 'ui-design-system';
import { Input } from 'ui-design-system';
import { Tag } from 'ui-design-system';
```

---

## Responsive Design

```typescript
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

---

## Animations

```typescript
// Transitions
className="transition-colors duration-200"
className="transition-opacity"

// Pulse loading
className="animate-pulse bg-grey-100 h-4 rounded"
```

---

## Summary

- Tailwind CSS utility classes
- `clsx` for conditional classes
- Use `ui-design-system` components when available
- Custom color palette (grey, purple, red, green scales)
