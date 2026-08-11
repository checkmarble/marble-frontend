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

## Inference First

Prefer TypeScript inference over annotations and assertions. Let values, parameters, and returns carry their types from construction — annotate only when a contract requires it.

### Return types

Omit return-type annotations. Infer from the implementation.

```typescript
// Prefer — return type inferred
function getOpenCases(cases: Case[]) {
  return cases.filter((c) => c.status !== 'closed');
}

// Avoid — annotation restates what the body already says
function getOpenCases(cases: Case[]): Case[] {
  return cases.filter((c) => c.status !== 'closed');
}
```

Annotate the return when a contract imposes the type — an interface / `implements`, a public boundary that must stay stable while the body changes, or an adapter that must produce a domain model.

```typescript
// OK — return type imposed by the interface
const repository: CaseRepository = {
  getById(id: string): Promise<Case> {
    return fetchCase(id);
  },
};

// OK — the annotation checks required and compatible fields at the adapter
function adaptCase(dto: CaseDto): Case {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: dto.created_at,
    inboxId: dto.inbox_id,
    contributors: dto.contributors.map(adaptCaseContributor),
    tags: dto.tags.map(adaptCaseTag),
  };
}
```

Without the annotation, a missing or mistyped field is not an error in `adaptCase` — it surfaces at the callers, or nowhere.

Use `satisfies Case` instead when callers must keep the narrower inferred shape and you still want the check at the adapter:

```typescript
// Callers see `status: 'open'`, not `status: CaseStatus`; `Case` compatibility is still enforced here
function adaptNewCase(dto: CaseDto) {
  return {
    ...adaptCase(dto),
    status: 'open',
  } satisfies Case;
}
```

### Assertions (`as`)

Do not use `as` to silence the type checker. Narrow, parse, or rebuild the value so the type follows from control flow.

```typescript
// Prefer — type guard / narrowing
function handle(data: unknown) {
  if (isCase(data)) {
    return data.id;
  }
}

// Prefer — Zod (or other) parse; type comes from schema
const payload = createListPayloadSchema.parse(raw);

// Prefer — `satisfies` checks shape without widening or lying
const statusLabels = {
  open: 'Open',
  closed: 'Closed',
} as const satisfies Record<CaseStatus, string>;

// Avoid — assertion that can lie
const caseData = response as Case;
const fieldType = field.dataType as PrimitiveTypes;
```

Allowed `as` uses (rare):

- `as const` for literal / tuple narrowing
- `as const satisfies T` to pin literals while checking against `T`
- bridging a typed third-party API that is wrong or incomplete — keep the cast at the boundary, in one place, with a short comment why

Never `as any`, `as unknown as T`, or double casts. If the value is untrusted, validate (`unknown` → guard / Zod); if it is trusted domain data, model it so inference works.

### Locals and parameters

Annotate parameters at function boundaries. Prefer inferring locals from initializers and generics.

```typescript
// Prefer
const cases = await getCases(filters);
const ids = cases.map((c) => c.id);

// Avoid — redundant annotations that fight inference
const cases: Case[] = await getCases(filters);
const ids: string[] = cases.map((c: Case) => c.id);
```

Use explicit types on empty collections or placeholders where inference would collapse to `never` / `any`:

```typescript
const selectedIds: string[] = [];
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

// DTO -> Domain — annotated so missing or mistyped fields fail here, not at the callers
export function adaptCase(dto: CaseDto): Case {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: dto.created_at,
    inboxId: dto.inbox_id,
    contributors: dto.contributors.map(adaptCaseContributor),
    tags: dto.tags.map(adaptCaseTag),
  };
}
```

### Bidirectional Adapters

For mutations, also adapt domain -> DTO:

```typescript
// Domain -> DTO (for API requests) — annotated with the DTO the API expects
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
  console.error(result.error); // typed as string
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
- Inference first: omit return annotations and `as` unless a contract or boundary requires them
- Annotate adapter returns (`: Case`) so field drift fails at the adapter; `satisfies Case` when callers need the narrower shape
- Narrow / parse / `satisfies` instead of asserting
- `import type` for type-only imports
- `import { z } from 'zod/v4'` (not `zod`)
- Model adapters for DTO <-> domain transforms
- Bidirectional adapters when mutations need DTO format
- `z.treeifyError()` for structured validation errors
