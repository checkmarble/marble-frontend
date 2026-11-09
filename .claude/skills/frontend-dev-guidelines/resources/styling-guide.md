# Styling Guide

Tailwind 4. Tokens: `packages/tailwind-preset/src/tailwind.css` (light in `@theme`, dark in `.dark`); app-only additions: `packages/app-builder/src/tailwind.css`, which also loads `app-builder/tailwind.config.ts` via `@config` (`tailwindcss-grid-areas` plugin, `lg-analytics` screen). A class is valid only if one of them defines its token or utility.

## Colours

The preset sets `--color-*: initial`: Tailwind's palette is gone, so `text-gray-500` or `bg-red-200` generate nothing, and neither do legacy Figma names still in old code (`text-grey-60`, `bg-grey-20`, `text-red-base`). Don't copy them.

Names are hue × role. Hues: `grey`, `purple`, `red`, `green`, `yellow`, `orange`. Roles: `-primary`, `-hover`, `-secondary`, `-placeholder`, `-disabled`, `-border`, `-background`, `-background-light`. Extras: `grey-white`, `purple-border-light`, `blue-58`/`blue-96` (the only numeric ones), `enum-*` (enum values, `models/enum.ts`).

Backgrounds: `surface-page` (body, `Page.Main`), `surface-card` (cards, modals, popovers, menus, panels), `surface-elevated` (tooltips, raised inline blocks), `surface-sidebar`. `grey-background` is a neutral hover/disabled fill, not the page. Table rows: use the DS `Table` (it handles `surface-row` striping and its dark-mode exception).

## Typography

- Pixel scale, used by most code including new code: `text-2xs` 10px, `text-xs` 12, `text-r` 13, `text-s` 14 (default UI text), `text-m` 16, `text-l` 20 (page titles).
- Figma scale, 140% line-height, used by `Typo` and `Button`: `text-h1` 20px, `text-h2` 16, `text-default` 14, `text-small` 12, `text-tiny` 10.

Tailwind's `text-sm`/`text-base` still generate (only colours are reset) but fit neither scale: use `text-s`. Headings: `<Typo variant="title1|title2|subtitle1|subtitle2">` (`h1`–`h4`). A bare `<Typo>` is `variant="text"`: a `<p>` in `text-tiny` (10px).

## Spacing

Named scale: `2xs` 2px, `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 40, `3xl` 48, `4xl` 80. Padding, margin and gap use it (`p-md`, `gap-sm`, not `p-4`). Traps:

- On `w-`/`h-`/`size-` the names are spacing values (`w-xl` = 2rem). Size with the numeric scale (`size-4`, `h-8`).
- On `max-w-`/`min-w-` the preset makes them container widths (`max-w-3xl` = 48rem).
- `cn` (tailwind-merge) doesn't know `4xl`: `cn('p-md', 'p-4xl')` keeps both.

## Dark mode

The `dark` class on `<html>` swaps token values. Not every token changes:

| Tokens | In dark mode |
|---|---|
| `surface-*`, `grey-*` except `-placeholder` and `-white`, every hue's `-primary`/`-hover`/`-secondary`/`-disabled`, `purple-border` | Flip |
| `enum-*` | Get darker |
| `*-placeholder`, `blue-*` | Unchanged |
| `purple-background-light` | Becomes `grey-background-light` |
| red/green/yellow/orange `-border`, `-background`, `-background-light` | Stay light pastel |
| `grey-white` (alias `white`) | Stays `#FFFFFF` |
| `purple-background`, `purple-border-light` | Get lighter |

So pastel and white fills need a `dark:` override. Check `<Tag color=…>` (outlined, works in both themes) or `Callout` first; for surfaces use `surface-*`, never `bg-white`.

## Custom variants

- `disabled:` matches `:disabled` or `[aria-disabled="true"]`; `enabled:` matches neither, on any element. Write hover as `enabled:hover:` so it skips disabled buttons and links.
- Radix state: `radix-state-open:`, `group-radix-state-open:`, … (tailwindcss-radix), same as `data-[state=open]:`.

## RTL

The `ar` locale renders `<html dir="rtl">`. Use logical utilities (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `border-s`/`border-e`, `rounded-s-`/`rounded-e-`, `text-start`/`text-end`). Flip directional icons with `rtl:rotate-180` (back arrows in `components/Page.tsx`).

## Animations

A kebab `animate-*` generates CSS only from Tailwind's defaults (`animate-spin`, `animate-pulse`, …), a `--animate-*` entry in the preset's `@theme`, or an `@utility` in the app's `tailwind.css`. The preset's other `.animate-*` are plain camelCase CSS classes (`animate-overlayShow`) that take no variants; their kebab spellings, still in old code (`animate-overlay-show`, `animate-slide-up-and-fade`), generate nothing. Radix enter/exit uses tw-animate-css (`data-[state=open]:animate-in fade-in-0 zoom-in-95`, see `ui-design-system/src/MenuCommand/MenuCommand.tsx`). Add an animation as an `--animate-*` entry plus `@keyframes` in the preset.
