# TypeScript Standards

Repo-specific conventions; generic TS advice is assumed.

## Setup

- `tsconfig.base.json` adds `noUncheckedIndexedAccess` (index-signature reads such as `arr[i]` or `Record<string, V>` are `T | undefined`; finite-key `Record<K, V>` and tuples are not) and `noPropertyAccessFromIndexSignature` (bracket access).
- Env: `getServerEnv('X')` / `getClientEnv('X')` (`utils/environment.ts`, typed per var). Don't add direct `process.env` reads.
- Import via the `tsconfig.base.json` aliases (`@app-builder/*`, `ui-design-system`, `marble-api`, …) or relative paths, never `packages/...`. Root `marble-api` re-exports only marblecore types; feature-access DTOs come from `marble-api/generated/feature-access-api`.
- Biome's linter preset is `none`: nothing blocks `any` or `as`, so reviewers enforce this file. Existing `as any` / `as unknown as` casts are debt, not precedent.

## Type imports

Inline modifier, the dominant style: `import { type Case, type CaseStatus } from '@app-builder/models/cases';`. Biome doesn't enforce it.

## Return types and adapters

Infer by default; annotate where a contract fixes the type:

- Adapters annotate their return, so a missing or mistyped field fails in the adapter, not at callers. Naming: `adaptXxx(dto: XxxDto): Xxx` maps a snake_case DTO to a camelCase model (`adaptCaseTag`, `models/cases.ts`); `adaptXxxDto` / `adaptXxxBody` go the other way, returning the generated body type (`adaptCreateScenarioIterationRuleBodyDto`, `models/scenario/iteration-rule.ts`).
- Repositories declare an interface and annotate the factory return once (`(marbleCoreApiClient: MarbleCoreApi): UserScoringRepository => ({ … })`); methods are then contextually typed (`repositories/UserScoringRepository.ts`).

## Form `defaultValues`

TanStack Form infers the form type from `defaultValues` alone (the validator schema is checked against it, not used to infer it).

- Pass a value typed as the payload: `const defaultValues: CreateListPayload = { … }`, or a prop typed as the payload (`components/Settings/Webhooks/UpdateWebhook.tsx`, for the typing only).
- `satisfies Payload` keeps each value's narrow type: literal-union and boolean fields stay literal (`kind: 'text'` then rejects `'cidrs'`), and fields defaulted to `null` or `[]`, or omitted optional ones, vanish from the field names. Use it only when every field is a plain `string`/`number`.
- `as Payload` (common in older forms) also hides missing fields; don't copy it.
- The schema's input type must be assignable to the form values: it may be narrower, never wider. `z.coerce.*` (input `unknown`), `.optional()` and `.default()` widen it: keep them out of the form's schema instead of casting it to `any`.

## Zod v4

- `import { z } from 'zod/v4'` (repo convention); root `'zod'` is the same v4 API, so don't migrate existing imports.
- `z.uuid()`, not `z.uuidv4()` (ids are not all v4; AST nodes use v7) nor the `@deprecated` `z.string().uuid()`; `z.looseObject()`, not the `@deprecated` `.passthrough()`.
- Payload arrays: `protectArray(z.array(…))` (`utils/schema/helpers/array.ts`, 1000-item cap). Uniqueness: `uniqueBy(z.array(…), keyOf)` (`utils/schema/helpers/unique-array.ts`), which emits a `duplicate_value` code: render that field's errors with `<FormError field={field} />`, which translates it (`getFieldErrors` only reads `.message`, so zod's default "Invalid input" would show).
- Where schemas live: [data-fetching.md](data-fetching.md).

## Exhaustiveness

- Generated `marble-api` enums are type-only unions. Alias the union in `models/` and declare its runtime list with `exhaustiveUnionList<U>()([...])` (`utils/types.ts`; `caseEventTypes` in `models/cases.ts`): a missing member fails type-check, and the list feeds `z.enum`. A typed array or `as const satisfies` doesn't check completeness, and TypeScript 7 sorts union members, so never derive a tuple from a union. `as const` + `(typeof xs)[number]` is for front-end-owned unions only.
- `assertNever(prefix, x)` (`typescript-utils`) is typed `never`, but in the app it doesn't throw: it logs outside production and returns `undefined`. A function that returns a value needs `return fallback;` after it. Editors grey that line out as unreachable (TS7027 suggestion); keep it. Most existing call sites lack it (`adaptRuleExecutionDto`, `models/decision.ts`); don't copy them. For UI branching, use ts-pattern `.exhaustive()`.

## Narrowing errors

API error guards and the redirect re-throw: [data-fetching.md](data-fetching.md). `tryCatch`: [common-patterns.md](common-patterns.md#utilities).
