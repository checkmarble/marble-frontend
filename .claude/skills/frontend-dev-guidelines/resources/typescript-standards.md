# TypeScript Standards

TypeScript best practices for the Marble codebase.

---

## Strict Mode

TypeScript strict mode is enabled. No implicit `any`, null/undefined must be handled explicitly.

```typescript
// Never
function handleData(data: any) { }

// Use specific types
function handleData(data: Case) { }

// Or unknown with type guards
function handleData(data: unknown) {
  if (isCase(data)) {
    // data is Case here
  }
}
```

---

## Type Imports

Use `type` keyword for type-only imports:

```typescript
import type { Case, CaseStatus } from '@app-builder/models/cases';
import type { Namespace } from 'i18next';
```

---

## Zod v4

Import from `zod/v4` (not `zod`):

```typescript
import { z } from 'zod/v4';

const createListPayloadSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
});

type CreateListPayload = z.infer<typeof createListPayloadSchema>;
```

### Validation in Actions

```typescript
const payload = createListPayloadSchema.safeParse(rawPayload);
if (!payload.success) {
  return { success: false, errors: z.treeifyError(payload.error) };
}
// payload.data is typed as CreateListPayload
```

### Validation in Forms

```typescript
const form = useForm({
  validators: {
    onSubmit: schema,
  },
});

// Per-field validation
<form.Field
  name="name"
  validators={{
    onBlur: schema.shape.name,
    onChange: schema.shape.name,
  }}
>
```

---

## Model Adapters

Transform API DTOs (snake_case) to domain models (camelCase):

```typescript
// models/cases.ts

// Domain model
export interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  createdAt: string;
  inboxId: string;
  contributors: CaseContributor[];
  tags: CaseTag[];
}

// DTO -> Domain
export const adaptCase = (dto: CaseDto): Case => ({
  id: dto.id,
  name: dto.name,
  status: dto.status,
  createdAt: dto.created_at,
  inboxId: dto.inbox_id,
  contributors: dto.contributors.map(adaptCaseContributor),
  tags: dto.tags.map(adaptCaseTag),
});
```

### Bidirectional Adapters

For mutations, also adapt domain -> DTO:

```typescript
// Domain -> DTO (for API requests)
export function adaptCreateRuleBodyDto(input: CreateRuleInput): CreateRuleBodyDto {
  return {
    scenario_iteration_id: input.scenarioIterationId,
    display_order: input.displayOrder,
    name: input.name,
    formula_ast_expression: input.formula ? adaptNodeDto(input.formula) : null,
    score_modifier: input.scoreModifier,
  };
}
```

---

## Component Props

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

## Discriminated Unions

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const result: ApiResult<Case> = await fetchCase(id);
if (result.success) {
  console.log(result.data); // typed as Case
} else {
  console.log(result.error); // typed as string
}
```

---

## Utility Types

```typescript
// Common patterns
type CaseUpdate = Partial<Case>;
type CasePreview = Pick<Case, 'id' | 'name'>;
type CaseWithoutId = Omit<Case, 'id'>;
type StatusMap = Record<CaseStatus, string>;
```

---

## Summary

- Strict mode, no `any`
- `import type` for type-only imports
- `import { z } from 'zod/v4'` (not `zod`)
- Model adapters for DTO <-> domain transforms
- Bidirectional adapters when mutations need DTO format
- `z.treeifyError()` for structured validation errors
