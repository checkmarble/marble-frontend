# Screening hit: display AI suggestion reason

## Problem

Screening hits can carry an AI-generated suggestion (`ScreeningAiSuggestion`), shown today as a confidence badge (e.g. "Likely false positive") next to the match name in `MatchCard.tsx`. The AI suggestion also carries a `reason` field — a 1–3 sentence explanation from the backend — that is fetched and typed but never rendered anywhere in the UI. Reviewers see *what* the AI concluded but not *why*, so they can't quickly judge whether to trust the suggestion.

## Goal

Render `aiSuggestion.reason` in the hit card, positioned between the name/badges row and the topic tag list, styled as an accented block with the product's existing "AI" visual language (purple accent + wand icon).

## Non-goals

- No changes to the AI suggestion data model, API, repository, query, or server-fn layers — `reason` already flows end-to-end and only needs to be rendered.
- No new i18n label/heading — the reason text is shown on its own, with no "AI summary:" or similar prefix.
- No truncation/expand-collapse — the full reason text is always shown.

## Design

### Location

`packages/app-builder/src/components/Screenings/MatchCard/MatchCard.tsx`, inserted between the existing `Collapsible.Title` block (name, AI confidence badge, similarity badge, review actions) and the existing topics block (`TopicsDisplay`).

### Visibility rule

The reason block follows the exact same visibility condition already used for the AI confidence badge at `MatchCard.tsx:50`:

```tsx
aiSuggestion && match.status === 'pending'
```

Additionally, only render if `aiSuggestion.reason` is non-empty (defensive — the field is documented as always present when a suggestion exists, but an empty string should render nothing rather than an empty box).

### Component

Extract a small local component, `AiSuggestionReason`, colocated in `MatchCard/` (new file `MatchCard/AiSuggestionReason.tsx`), taking `reason: string` as its only prop. Keeps `MatchCard.tsx` uncluttered and gives the block a clear, independently readable unit.

### Visual treatment

Matches the mockup: a block with a left border accent and a wand icon, in a single bordered box (both icon and text share the same padding so they align on one baseline):

- Box: `bg-surface-card border-grey-border border-l-purple-primary text-grey-primary text-small rounded-sm border border-l-2 p-sm`
- Icon: `<Icon icon="wand" className="text-purple-primary size-4 shrink-0" />`
- Text: full reason string, rendered as plain static text (`<p className="whitespace-pre-wrap">`) — no truncation, no label/title, no Markdown parsing, no typing/animation effect. (An earlier iteration reused the shared `AIText` component for this, but that component always plays a typewriter animation and parses Markdown, both wrong for a static, backend-persisted reason shown on every panel load — so this renders as plain text instead, keeping only the purple-accent box styling.)
- Layout: icon and text side-by-side inside the one box, block indented/inset below the name row, above the topics row

### Data flow

No changes. `aiSuggestion` is already passed into `MatchCard` as a prop (`MatchCard.tsx:24`), sourced from `ScreeningHitsPanel.tsx`'s `aiSuggestionsByMatchId` map. `AiSuggestionReason` receives `aiSuggestion.reason` directly.

## Testing

- Render `MatchCard` with a `pending` match + `aiSuggestion` containing a `reason` → block appears between name row and topics.
- Render with a non-`pending` match (`confirmed_hit`, `no_hit`, `skipped`) + `aiSuggestion` present → block does not appear (mirrors existing badge behavior).
- Render with no `aiSuggestion` → block does not appear.
- Render with `aiSuggestion.reason === ''` → block does not appear.
