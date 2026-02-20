# AI Rule Generation Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal UI panel for generating rule formulas from natural language instructions using the new backend `/generate` endpoint.

**Architecture:** Add a new `AiGenerateRule` component that appears next to the formula editor. User enters instruction → clicks Generate → API call replaces formula with result (showing validation errors if any). Keep it minimal for POC/testing purposes.

**Tech Stack:** React, TanStack Query (useQuery/useMutation), Zod (for API response types), existing UI components

---

## Task 1: Create API response types and mutation hook

**Files:**
- Create: `packages/app-builder/src/queries/scenarios/generate-rule.ts`

**Step 1: Write the mutation hook file**

Create the file with the mutation hook for calling the generate endpoint:

```typescript
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// API response types matching backend
const ASTValidationDetailSchema = z.object({
  is_valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

const GenerateRuleResponseSchema = z.object({
  rule_ast: z.any(), // NodeDto from backend
  validation: ASTValidationDetailSchema,
});

export type GenerateRuleResponse = z.infer<typeof GenerateRuleResponseSchema>;
export type ASTValidationDetail = z.infer<typeof ASTValidationDetailSchema>;

export function useGenerateRuleMutation(ruleId: string) {
  return useMutation({
    mutationFn: async (instruction: string) => {
      const response = await fetch(
        `/api/scenario-iteration-rules/${ruleId}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate rule: ${response.statusText}`);
      }

      const data = await response.json();
      return GenerateRuleResponseSchema.parse(data);
    },
  });
}
```

**Step 2: Verify the file is valid TypeScript**

Run: `cd packages/app-builder && bun run type-check`
Expected: No errors related to this file

**Step 3: Commit**

```bash
cd packages/app-builder
git add src/queries/scenarios/generate-rule.ts
git commit -m "feat: add useGenerateRuleMutation hook for AI rule generation"
```

---

## Task 2: Create the AiGenerateRule component

**Files:**
- Create: `packages/app-builder/src/components/Scenario/Rules/AiGenerateRule.tsx`

**Step 1: Write the component**

Create the component with minimal UI:

```typescript
import { useGenerateRuleMutation } from '@app-builder/queries/scenarios/generate-rule';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface AiGenerateRuleProps {
  ruleId: string;
  onFormulaGenerated: (formula: any) => void;
}

export function AiGenerateRule({ ruleId, onFormulaGenerated }: AiGenerateRuleProps) {
  const { t } = useTranslation(['scenarios']);
  const [instruction, setInstruction] = useState('');
  const mutation = useGenerateRuleMutation(ruleId);

  const handleGenerate = async () => {
    try {
      const result = await mutation.mutateAsync(instruction);

      // Apply the generated formula regardless of validation status
      if (result.rule_ast) {
        onFormulaGenerated(result.rule_ast);
        setInstruction('');
      }

      // Show validation errors if any
      if (!result.validation.is_valid && result.validation.errors.length > 0) {
        console.warn('Generated rule has validation errors:', result.validation.errors);
        // TODO: Show toast with errors for now
        alert(`Generated rule has errors:\n${result.validation.errors.join('\n')}`);
      }
    } catch (error) {
      alert(`Error generating rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-surface-card border-grey-border rounded-md border p-4 max-w-2xl">
      <h3 className="text-s font-medium mb-3">{t('scenarios:ai_generate_rule.title', 'Generate with AI')}</h3>

      <div className="flex flex-col gap-2">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.currentTarget.value)}
          placeholder={t('scenarios:ai_generate_rule.placeholder', 'Describe what rule you want to create...')}
          disabled={mutation.isPending}
          className="form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
          rows={3}
        />

        <Button
          onClick={handleGenerate}
          disabled={!instruction.trim() || mutation.isPending}
          variant="primary"
          size="sm"
        >
          {mutation.isPending ? (
            <>
              <Icon icon="hourglass" className="size-4 animate-spin" aria-hidden />
              Generating...
            </>
          ) : (
            <>
              <Icon icon="sparkles" className="size-4" aria-hidden />
              Generate Rule
            </>
          )}
        </Button>

        {mutation.data?.validation && (
          <div className="mt-3 p-3 bg-grey-background rounded text-sm">
            <div className="font-medium mb-2">
              {mutation.data.validation.is_valid ? '✓ Valid' : '⚠️ Validation Issues'}
            </div>
            {mutation.data.validation.errors.length > 0 && (
              <div className="text-red-600">
                <div className="font-medium">Errors:</div>
                <ul className="list-disc pl-4">
                  {mutation.data.validation.errors.map((err, i) => (
                    <li key={i} className="text-xs">{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {mutation.data.validation.warnings.length > 0 && (
              <div className="text-yellow-600 mt-2">
                <div className="font-medium">Warnings:</div>
                <ul className="list-disc pl-4">
                  {mutation.data.validation.warnings.map((warn, i) => (
                    <li key={i} className="text-xs">{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify the file compiles**

Run: `cd packages/app-builder && bun run type-check`
Expected: No errors

**Step 3: Commit**

```bash
cd packages/app-builder
git add src/components/Scenario/Rules/AiGenerateRule.tsx
git commit -m "feat: add AiGenerateRule component for UI"
```

---

## Task 3: Integrate component into rule detail page

**Files:**
- Modify: `packages/app-builder/src/routes/_builder+/detection+/scenarios+/$scenarioId+/i+/$iterationId+/rules.$ruleId.tsx`

**Step 1: Add import for AiGenerateRule**

Add this import near the top with other imports:

```typescript
import { AiGenerateRule } from '@app-builder/components/Scenario/Rules/AiGenerateRule';
```

**Step 2: Update the formula grid layout**

Find this line (around line 399):
```typescript
<div className="grid grid-cols-[var(--container-3xl)_1fr] gap-v2-lg">
```

Change it to conditionally show the AI panel:
```typescript
<div className={cn('gap-v2-lg', {
  'grid grid-cols-[var(--container-3xl)_1fr]': editor === 'edit',
  'grid grid-cols-1': editor === 'view',
})}>
```

**Step 3: Add AiGenerateRule component after FieldAstFormula**

After the `FieldAstFormula` component closes (after line 422), add:

```typescript
{editor === 'edit' && (
  <AiGenerateRule
    ruleId={rule.id}
    onFormulaGenerated={(generatedAst) => {
      form.setFieldValue('formula', generatedAst);
    }}
  />
)}
```

**Step 4: Verify the file compiles**

Run: `cd packages/app-builder && bun run type-check`
Expected: No errors

**Step 5: Commit**

```bash
cd packages/app-builder
git add src/routes/_builder+/detection+/scenarios+/$scenarioId+/i+/$iterationId+/rules.$ruleId.tsx
git commit -m "feat: integrate AiGenerateRule component into rule editor"
```

---

## Task 4: Manual testing in dev environment

**Step 1: Start the dev server**

```bash
cd packages/app-builder
bun run dev
```

Expected: Dev server running on http://localhost:3000

**Step 2: Navigate to a rule editor**

1. Go to http://localhost:3000/detection/scenarios
2. Select a scenario
3. Select an iteration
4. Click on a rule to edit it

**Step 3: Test the AI Generate panel**

1. Scroll down to the formula section
2. You should see the new "Generate with AI" panel on the right
3. Enter a test instruction (e.g., "Flag transactions over 1000")
4. Click "Generate Rule"
5. Verify:
   - Loading state shows while generating
   - Generated formula appears in the main editor
   - Validation errors/warnings display if any
   - You can save the rule normally

**Step 4: Test error cases**

1. Try with invalid instruction or no instruction (button should be disabled)
2. Check browser console for any errors

**Step 5: Manual verification complete**

No automated tests needed for POC. Just confirm the UI works end-to-end.

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| `src/queries/scenarios/generate-rule.ts` | Create | New mutation hook for API calls |
| `src/components/Scenario/Rules/AiGenerateRule.tsx` | Create | New component for UI |
| `rules.$ruleId.tsx` | Modify | Integrate AiGenerateRule component |

---

## Notes for POC

- Alert boxes used instead of toast for simplicity
- Basic error handling (logs to console)
- No i18n translations (using English directly)
- Minimal styling using existing Tailwind classes
- API endpoint assumes it's available at `/api/scenario-iteration-rules/:ruleId/generate`

To replace alerts with toasts later, import `setToastMessage` like other pages do.

