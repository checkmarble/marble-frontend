---
name: frontend-dev-guidelines
description: Use when writing, editing, or creating components, pages, routes, forms, tables, modals, queries, hooks, loaders, or actions in packages/app-builder or packages/ui-design-system. Covers React patterns, TanStack Query/Form, Radix UI, virtual tables, MenuCommand, Tailwind color tokens, file organization, and TypeScript standards. Basic conventions (imports, styling, i18n, resource route middleware) are in .claude/rules/ — this skill provides the deep reference patterns and code examples.
---

# Frontend Development Guidelines

Deep reference guide for complex React patterns in the Marble monorepo. For basic conventions (imports, styling, routes, i18n), see `.claude/rules/`.

## Core Conventions

### Components

```typescript
// Plain function declarations - NOT React.FC or FunctionComponent
// Named exports only - NO default exports
// Props via interface (or type)

interface CaseCardProps {
  caseData: Case;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CaseCard({ caseData, onSelect, className }: CaseCardProps) {
  return (
    <div className={cn('rounded-lg border border-grey-border p-4', className)}>
      <h3 className="text-l font-semibold text-grey-primary">{caseData.name}</h3>
      <Button onClick={() => onSelect?.(caseData.id)}>Select</Button>
    </div>
  );
}
```

### Query Hook (one file per query)

```typescript
// queries/cases/get-case.ts
import { useQuery } from '@tanstack/react-query';
import { getRoute } from '@app-builder/utils/routes';

export function useGetCaseQuery(caseId: string) {
  return useQuery({
    queryKey: ['cases', 'get-case', caseId],
    queryFn: async () => {
      const response = await fetch(
        getRoute('/ressources/cases/:caseId', { caseId }),
      );
      return response.json() as Promise<CaseDetail>;
    },
    enabled: !!caseId,
  });
}
```

---

## Topic Guides

Read these when working on specific areas:

| Topic | Resource | When to read |
|-------|----------|-------------|
| Component patterns | [component-patterns.md](resources/component-patterns.md) | Writing/editing components |
| Data fetching | [data-fetching.md](resources/data-fetching.md) | Queries, mutations, loaders, actions |
| Routing | [routing-guide.md](resources/routing-guide.md) | Routes, breadcrumbs, navigation |
| Styling | [styling-guide.md](resources/styling-guide.md) | Color tokens, surface tokens, dark mode |
| Tables & selects | [tables-and-selects.md](resources/tables-and-selects.md) | Virtual tables, MenuCommand dropdowns |
| Forms & modals | [forms-and-modals.md](resources/forms-and-modals.md) | TanStack Form, Modal, Panel |
| Common patterns | [common-patterns.md](resources/common-patterns.md) | ts-pattern, remeda, icons, toasts, dates |
| File organization | [file-organization.md](resources/file-organization.md) | Architecture layers, naming |
| TypeScript | [typescript-standards.md](resources/typescript-standards.md) | Types, Zod v4, model adapters |
