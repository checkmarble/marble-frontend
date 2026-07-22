# Screening Hit AI Suggestion Reason Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the existing but unused `ScreeningAiSuggestion.reason` field in `MatchCard`, between the match name/badges row and the topic tag list.

**Architecture:** Add a small presentational component, `AiSuggestionReason`, colocated next to `MatchCard`. It renders the product's established "AI content" primitive (`AIText` from `ui-design-system`, already used in `AiDescription.tsx` and `AiReviewCard.tsx`) alongside the existing `wand` icon. `MatchCard.tsx` renders it conditionally, reusing the exact visibility condition already governing the AI confidence badge.

**Tech Stack:** React (TanStack Start app), TypeScript, Tailwind CSS 4, `ui-design-system` (`AIText`), `ui-icons` (`Icon icon="wand"`).

## Global Constraints

- No changes to the AI suggestion data model, API, repository, query, or server-fn layers — `aiSuggestion.reason` already flows end-to-end into `MatchCard` as a prop.
- No new i18n keys — the reason text is rendered with no label/title.
- No truncation — the full reason text is always shown (no `maxLines` on `AIText`).
- Visibility must exactly mirror the existing AI confidence badge condition: `aiSuggestion && match.status === 'pending'` (`MatchCard.tsx:50`), plus a non-empty `reason` check.
- **Testing note:** `packages/app-builder` has zero existing test files and no `@testing-library/react` dependency (confirmed: `find packages/app-builder -iname "*.test.ts*"` returns nothing, and it's absent from `package.json`). Adding that dependency is out of scope for this change. Both tasks below are verified via `bun run type-check` and manual verification in the dev server instead of automated component tests — this follows the package's existing (untested) convention rather than introducing a new, one-off test setup.

---

### Task 1: Create the `AiSuggestionReason` component

**Files:**
- Create: `packages/app-builder/src/components/Screenings/MatchCard/AiSuggestionReason.tsx`

**Interfaces:**
- Consumes: `AIText` from `ui-design-system` (props: `{ text: string; pace?: number; maxLines?: number; className?: string }`, confirmed at `packages/ui-design-system/src/AIText/AIText.tsx`); `Icon` from `ui-icons` (prop `icon: string`, confirmed usage `<Icon icon="wand" className="size-4" />` at `MatchCard.tsx:53`).
- Produces: `AiSuggestionReason` component, `{ reason: string }` props, default export is a named export `AiSuggestionReason`. Task 2 imports it as:
  ```tsx
  import { AiSuggestionReason } from './AiSuggestionReason';
  ```

- [ ] **Step 1: Write the component**

Create `packages/app-builder/src/components/Screenings/MatchCard/AiSuggestionReason.tsx`:

```tsx
import { AIText } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiSuggestionReasonProps = {
  reason: string;
};

export const AiSuggestionReason = ({ reason }: AiSuggestionReasonProps) => {
  return (
    <div className="flex items-start gap-xs">
      <Icon icon="wand" className="text-purple-primary mt-xs size-4 shrink-0" />
      <AIText text={reason} className="flex-1" />
    </div>
  );
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd packages/app-builder && bun run type-check`
Expected: no new errors mentioning `AiSuggestionReason.tsx`.

- [ ] **Step 3: Commit**

```bash
git add packages/app-builder/src/components/Screenings/MatchCard/AiSuggestionReason.tsx
git commit -m "feat: add AiSuggestionReason component for screening hits"
```

---

### Task 2: Render the reason in `MatchCard`

**Files:**
- Modify: `packages/app-builder/src/components/Screenings/MatchCard/MatchCard.tsx:44-87`

**Interfaces:**
- Consumes: `AiSuggestionReason` from Task 1 (`{ reason: string }`); existing `aiSuggestion?: ScreeningAiSuggestion` prop already on `MatchCardProps` (`ScreeningAiSuggestion.reason: string`, confirmed in `packages/app-builder/src/models/screening-ai-suggestion.ts`); existing `match.status` (`ScreeningMatchStatus`).
- Produces: no new exports — this is the leaf usage site.

- [ ] **Step 1: Import the new component**

In `packages/app-builder/src/components/Screenings/MatchCard/MatchCard.tsx`, add to the existing import block (after the `CommentLine` import at line 13):

```tsx
import { AiSuggestionReason } from './AiSuggestionReason';
```

- [ ] **Step 2: Insert the reason block between the title row and the topics block**

Current code (`MatchCard.tsx:82-87`):

```tsx
        </div>
      </Collapsible.Title>
      {entity.properties['topics']?.length ? (
        <div className="px-md pb-md">
          <TopicsDisplay entity={entity} containerClassName="flex flex-wrap gap-xs" />
        </div>
      ) : null}
```

Replace with:

```tsx
        </div>
      </Collapsible.Title>
      {aiSuggestion && match.status === 'pending' && aiSuggestion.reason ? (
        <div className="px-md pb-sm">
          <AiSuggestionReason reason={aiSuggestion.reason} />
        </div>
      ) : null}
      {entity.properties['topics']?.length ? (
        <div className="px-md pb-md">
          <TopicsDisplay entity={entity} containerClassName="flex flex-wrap gap-xs" />
        </div>
      ) : null}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd packages/app-builder && bun run type-check`
Expected: no new errors.

- [ ] **Step 4: Manually verify in the dev server**

Run: `cd packages/app-builder && bun run dev`

Open a screening with at least one `pending` hit that has an AI suggestion (or temporarily hardcode a fixture value in `ScreeningHitsPanel.tsx`'s `aiSuggestionsByMatchId` build step if no seeded data has suggestions, then revert the hardcode before committing). Confirm:
- The reason block appears between the name/badge row and the topic tags, only for `pending` hits with a suggestion.
- The wand icon and purple-accented text box match the established AI styling used in `AiDescription.tsx` / `AiReviewCard.tsx`.
- A hit with no `aiSuggestion`, or a hit whose status is `confirmed_hit`/`no_hit`/`skipped`, does not show the block.
- A hit with `aiSuggestion.reason === ''` does not show the block.

- [ ] **Step 5: Commit**

```bash
git add packages/app-builder/src/components/Screenings/MatchCard/MatchCard.tsx
git commit -m "feat: display AI suggestion reason on screening hits"
```
