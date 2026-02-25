# File Organization

Layered architecture and naming conventions for the Marble app-builder.

---

## App-Builder Architecture

```
packages/app-builder/src/
  routes/            # Remix routes (flat structure with + folders)
  components/        # App-specific UI components (by domain)
  queries/           # TanStack Query hooks (one file per query)
  repositories/      # Data access layer (interfaces + factory functions)
  services/          # Business logic services
  models/            # Data models + adapter functions
  hooks/             # Custom React hooks
  contexts/          # React contexts
  schemas/           # Zod schemas
  utils/             # Utilities
  types/             # TypeScript types
  constants/         # Constants
  locales/           # i18n translations (en/, fr/, ar/)
  middlewares/       # Server middleware (auth, redirect)
  core/              # Framework core (requests, middleware types)
```

---

## Layer Responsibilities

| Layer | Purpose | Example |
|-------|---------|---------|
| **routes/** | Remix routes, loaders, actions | `_builder+/cases+/$caseId+/_index.tsx` |
| **components/** | UI components grouped by domain | `Cases/CaseDetails.tsx`, `AstBuilder/Root.tsx` |
| **queries/** | TanStack Query hooks (one per file) | `cases/get-cases.ts`, `cases/edit-name.ts` |
| **repositories/** | API call abstraction + DTO transforms | `CaseRepository.ts` (interface + factory) |
| **services/** | Business logic | `init.server.ts` (service initialization) |
| **models/** | Types + adapters | `cases.ts` (Case interface + adaptCase) |
| **middlewares/** | Server middleware | `auth-middleware.ts`, `handle-redirect-middleware.ts` |

Data flows: `routes -> components -> queries -> fetch(resource routes) -> repositories -> API`

---

## Directory Conventions

### components/

Organized by domain, each domain gets a folder:

```
components/
  Cases/
    CaseDetails.tsx
    CaseEvents.tsx
    InboxPage.tsx
  Analytics/
    Decisions.tsx
    RulesHit.tsx
  AstBuilder/
    edition/
      EditionNode.tsx
      EditionAndRoot.tsx
  Form/
    Tanstack/
      FormInput.tsx
      FormLabel.tsx
      FormErrorOrDescription.tsx
  Panel/
    Panel.tsx
  Breadcrumbs.tsx
  MarbleToaster.tsx
  Spinner.tsx
```

### queries/

One file per query, grouped by domain:

```
queries/
  cases/
    get-cases.ts       # useGetCasesQuery
    get-case.ts        # useGetCaseQuery
    edit-name.ts       # useEditNameMutation + editNamePayloadSchema
    add-comment.ts     # useAddCommentMutation
  scenarios/
    create-scenario.ts
    scenario-iteration-rules.ts
  lists/
    create-list.ts
  settings/
    api-keys/
      delete-api-key.ts
```

### repositories/

Interface + factory function per domain:

```
repositories/
  CaseRepository.ts       # Interface + makeGetCaseRepository()
  ScenarioRepository.ts
  init.server.ts           # Server-side repository initialization
  init.client.ts           # Client-side repository initialization
```

### models/

Domain types + adapter functions:

```
models/
  cases.ts                 # Case, CaseDto, adaptCase()
  decision.ts              # Decision, adaptDecision()
  scenario/
    iteration-rule.ts      # ScenarioIterationRule, adaptScenarioIterationRule()
  pagination.ts            # Pagination helpers
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase.tsx | `CaseDetails.tsx` |
| Queries | kebab-case.ts | `get-cases.ts` |
| Repositories | PascalCase.ts | `CaseRepository.ts` |
| Models | kebab-case.ts | `cases.ts` |
| Hooks | camelCase.ts | `useCurrentUser.ts` |
| Routes | Remix convention | `_builder+/cases+/$caseId+/_index.tsx` |
| Schemas | kebab-case.ts | `lists.ts` |
| Server utils | `.server.ts` suffix | `update-rule.server.ts` |

### Export Conventions

```typescript
// Components - named exports only
export function CaseDetails({ caseData }: CaseDetailsProps) { }

// Compound components - namespace object
export const AiAssist = { Root, Trigger, Content };

// Queries - named hook export
export function useGetCaseQuery(caseId: string) { }

// Mutations - named hook export + Zod schema
export const editNamePayloadSchema = z.object({ ... });
export function useEditNameMutation() { }

// Models - named exports
export interface Case { }
export const adaptCase = (dto: CaseDto): Case => ({ ... });
```

---

## When to Create Where

| Need | Location |
|------|----------|
| Reusable UI component | `packages/ui-design-system/` |
| App-specific component | `packages/app-builder/src/components/{Domain}/` |
| New query/mutation hook | `queries/{domain}/` |
| API call abstraction | `repositories/` |
| Business logic | `services/` |
| Data types + adapters | `models/` |
| Custom hook | `hooks/` |
| Global state | `contexts/` |
| Validation schema | `schemas/` |
| i18n translations | `locales/{en,fr,ar}/{namespace}.json` |
