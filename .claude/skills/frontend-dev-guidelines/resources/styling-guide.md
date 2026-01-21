# Styling Guide

Tailwind CSS styling patterns for the Marble app-builder.

---

## Primary Method: Tailwind CSS

Use utility classes directly in JSX:

```typescript
<div className="flex items-center gap-4 p-2 rounded-lg border border-grey-border">
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
      'border-purple-primary bg-purple-background': isActive,
      'border-grey-border hover:bg-grey-background-light': !isActive,
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

// Text colors (semantic - auto-adapt to dark mode)
className="text-grey-primary"      // main text
className="text-grey-placeholder"  // muted/placeholder text
className="text-grey-disabled"     // disabled text
className="text-purple-primary"    // purple accent
className="text-purple-hover"      // purple hover state
className="text-red-primary"       // error text
className="text-green-primary"     // success text
```

### Backgrounds

```typescript
// Background colors (semantic - auto-adapt to dark mode)
className="bg-grey-background"        // main background
className="bg-grey-background-light"  // lighter background (hover states)
className="bg-purple-background"      // purple background
className="bg-purple-background-light" // light purple background
```

### Borders

```typescript
className="border border-grey-border rounded-lg"
className="border-b border-grey-border"
```

---

## Color Palette

The project uses **semantic color classes** that automatically adapt to dark mode:

### Text Colors
```
text-grey-primary       // Main text color
text-grey-placeholder   // Muted/secondary text
text-grey-disabled      // Disabled state text
text-purple-primary     // Purple accent text
text-purple-hover       // Purple hover state
text-red-primary        // Error text
text-green-primary      // Success text
```

### Background Colors
```
bg-grey-background        // Main background
bg-grey-background-light  // Lighter background (hover states, highlights)
bg-purple-background      // Purple tinted background
bg-purple-background-light // Light purple background
```

### Border Colors
```
border-grey-border   // Standard borders
```

### Dark Mode
These semantic colors automatically switch values in dark mode. Use `dark:` prefix only when you need different behavior:
```typescript
className="text-purple-primary dark:text-grey-primary"  // Override in dark mode
className="hover:bg-grey-background-light dark:hover:bg-grey-background"
```

---

## Using ui-design-system

For complex UI, use pre-built components:

```typescript
import { ButtonV2 } from 'ui-design-system';
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
className="animate-pulse bg-grey-background-light h-4 rounded"
```

---

## Summary

- Tailwind CSS utility classes
- `clsx` for conditional classes
- Use `ui-design-system` components when available
- **Semantic color classes** that auto-adapt to dark mode (e.g., `text-grey-primary`, `bg-grey-background`)
- Use `dark:` prefix only when overriding default dark mode behavior
