# TypeScript Standards

TypeScript best practices for the Marble codebase.

---

## Strict Mode

TypeScript strict mode is enabled. This means:
- No implicit `any` types
- Null/undefined must be handled explicitly

---

## No `any` Type

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

```typescript
// Use 'type' keyword for type-only imports
import type { Case, CaseStatus } from '@app-builder/models/cases';
import type { FunctionComponent } from 'react';
```

---

## Component Props

```typescript
interface CaseCardProps {
  /** The case to display */
  caseData: Case;
  /** Called when case is selected */
  onSelect?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export const CaseCard: FunctionComponent<CaseCardProps> = ({
  caseData,
  onSelect,
  className,
}) => {
  // ...
};
```

---

## Zod Schemas

Use Zod for runtime validation and type inference:

```typescript
import { z } from 'zod';

const caseFilterSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['open', 'closed']).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type CaseFilter = z.infer<typeof caseFilterSchema>;
```

---

## Model Adapters

Transform API responses to typed models:

```typescript
// models/cases.ts
export interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  createdAt: Date;
}

export function adaptCase(dto: CaseDto): Case {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status as CaseStatus,
    createdAt: new Date(dto.created_at),
  };
}
```

---

## Utility Types

```typescript
// Partial - all properties optional
type CaseUpdate = Partial<Case>;

// Pick - select properties
type CasePreview = Pick<Case, 'id' | 'name'>;

// Omit - exclude properties
type CaseWithoutId = Omit<Case, 'id'>;

// Record - object map
type StatusMap = Record<CaseStatus, string>;
```

---

## Discriminated Unions

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// TypeScript narrows based on success
const result: ApiResult<Case> = await fetchCase(id);
if (result.success) {
  console.log(result.data); // Case
} else {
  console.log(result.error); // string
}
```

---

## Summary

- Strict mode enabled
- No `any` - use specific types or `unknown`
- Use `import type` for type imports
- JSDoc comments on props
- Zod for runtime validation
- Model adapters for API responses
