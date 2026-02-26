# Styling Guide

Tailwind CSS 4 styling with CSS variable-based theming.

---

## Color System

The project uses **semantic CSS variables** (oklch) defined in `packages/tailwind-preset/src/tailwind.css`. Colors automatically flip in dark mode.

### Text Colors

```
text-grey-primary         # Main text
text-grey-hover           # Hover state text
text-grey-secondary       # Secondary text
text-grey-placeholder     # Muted/placeholder text
text-grey-disabled        # Disabled state
text-purple-primary       # Purple accent (links, active items)
text-purple-hover         # Purple hover state
text-red-primary          # Error text
text-green-primary        # Success text
text-yellow-primary       # Warning text
```

### Background Colors

```
bg-grey-background        # Main page background
bg-grey-background-light  # Lighter background (hover states)
bg-grey-white             # White
bg-purple-background      # Purple tinted background
bg-purple-background-light # Light purple background
bg-red-background         # Error background
bg-green-background       # Success background
```

### Surface Tokens (auto-flip in dark mode)

These semantic tokens are the preferred way to set backgrounds:

```
bg-surface-page           # Page background
bg-surface-card           # Card/container background
bg-surface-sidebar        # Sidebar background
bg-surface-elevated       # Elevated elements (popovers, modals)
bg-surface-row            # Table row background
bg-surface-row-hover      # Table row hover
```

### Border Colors

```
border-grey-border        # Standard borders
border-purple-primary     # Active/focused borders
border-red-primary        # Error borders
```

---

## Typography

```
text-2xl    # 28px / 32px  (page titles)
text-l      # 20px / 30px  (section headers)
text-m      # 16px / 24px  (body text)
text-s      # 14px / 21px  (default UI text)
text-r      # 13px / 20px  (compact text)
text-xs     # 12px / 18px  (small labels)
text-2xs    # 10px / 12px  (tiny labels)
```

---

## Spacing (v2 scale)

```
gap-v2-xs    # 0.25rem (4px)
gap-v2-sm    # 0.5rem  (8px)
gap-v2-md    # 1rem    (16px)
gap-v2-lg    # 1.5rem  (24px)
gap-v2-xl    # 2rem    (32px)
gap-v2-xxl   # 2.5rem  (40px)
gap-v2-xxxl  # 3rem    (48px)
```

Standard Tailwind spacing (`p-4`, `gap-2`, `m-6`) is also widely used.

---

## Common Layout Patterns

```typescript
// Flexbox row with gap
<div className="flex items-center gap-4">

// Flexbox column
<div className="flex flex-col gap-2">

// Space between
<div className="flex justify-between items-center">

// Card container
<div className="bg-surface-card border-grey-border rounded-lg border p-4">

// Conditional classes — prefer cn over clsx (cn resolves Tailwind conflicts)
import { cn } from 'ui-design-system';
<div className={cn(
  'rounded-lg border p-4 transition-colors',
  isActive
    ? 'border-purple-primary bg-purple-background'
    : 'border-grey-border hover:bg-grey-background-light',
)}>
```

---

## Dark Mode

Colors are CSS variables that auto-flip via `.dark` class on the root element. Most of the time, you don't need to do anything special.

```css
/* What happens under the hood */
.dark {
  --color-grey-primary: oklch(98.54% ...);     /* Becomes light text */
  --color-surface-page: oklch(5% ...);          /* Becomes dark bg */
  --color-purple-primary: oklch(63.77% ...);    /* Adjusted for contrast */
}
```

Use `dark:` prefix only when you need different behavior from the default:

```typescript
className="text-purple-primary dark:text-grey-primary"
className="hover:bg-grey-background-light dark:hover:bg-grey-background"
```

---

## Animations

```typescript
// Transitions
className="transition-colors duration-200"

// Skeleton loading
className="animate-pulse bg-grey-background-light h-4 rounded"

// Slide-in (used by Panel)
className="animate-slideRightAndFadeIn"
```

---

## Summary

- **Semantic colors** auto-adapt to dark mode (e.g., `text-grey-primary`, `bg-surface-card`)
- **Surface tokens** (`bg-surface-card`, `bg-surface-page`) for main backgrounds
- **`cn`** (from ui-design-system) for conditional classes — resolves Tailwind conflicts
- Use `dark:` only when overriding defaults
- Use ui-design-system components when available instead of raw HTML + Tailwind
