---
name: ast-builder-developer
description: Use when working with AstBuilder components, editing AST nodes or operands, building AST edit modals, managing the AST node store (sharpstate), changing validation flows, or modifying any rule-builder UI (edit or view mode).
---

# AST Builder Developer Guide

AstBuilder: `packages/app-builder/src/components/AstBuilder`, alias `@ast-builder/*`.

## Architecture

- `Root.tsx` routes by shape (`And` trigger, `OrWithAnd` rule, else Any), then by `mode` to `edition/Edition*` or `viewing/Viewing*`.
- Node store: `edition/node-store.ts`, created by `edition/hooks/useRoot.ts`. Validation helpers: `edition/helpers.ts`.

## State factories (sharpstate)

- `AstBuilderDataSharpFactory` (`Provider.tsx`): options `data`, `scenarioId`, `mode`, `showValues`, `isValueSwitchOpen`; computed `triggerObjectTable`.
- `AstBuilderNodeSharpFactory`, edit mode only: `node`, `validation`, `copiedNode`; actions `setNodeAtPath`, `validate`, `copyNode`, `triggerUpdate`. Create it with `useRoot()` (Edition roots, `OperandEditModal`, ValueSwitch, `UserScoring/SwitchNode/AggregateRuleEdit.tsx`). `CustomerKpisConfigurationPopover.tsx` and the `EditFilters.spec.tsx` harness bypass it (`createSharp`, no-op `validationFn`).
- `EditionOperandSharpFactory` (`edition/EditionOperand.tsx`), per operand: `filteredOptions` applies `optionsDataType` / `excludeFuntionsType` / `excludeFields` to the menu.

## Hosting

- `Provider` fetches options by `scenarioId` (default `mode="view"`). `StaticProvider` takes `data` (default `"edit"`) and has no `scenarioId`, so validation is always empty.
- Operand-constraining props are in `AstBuilderRootProps` (`types.ts`); note the spelling `excludeFuntionsType`.
- **Edit-mode roots are uncontrolled**: `createSharp` runs once (sharpstate `useRefFn`), so a new `node` prop is ignored. Read changes via `onUpdate`; to replace the formula, remount with `key` (`formulaKey` in `Scenario/Rules/RuleEditPanel.tsx`).
- `view` mode exists only for And and OrWithAnd roots; others render `'view mode not supported yet!'`.

## Node types

- Import, don't redeclare: builder-level types and guards (`EditableAstNode`, `isKnownOperandAstNode`, `isMainAst*`) from `@app-builder/models/astNode/builder-ast-node`; per-node ones from `@app-builder/models/astNode/<kind>`; `NewUndefinedAstNode`, `IdLessAstNode`, `injectIdToNode` from `@app-builder/models`.
- `Undefined` with no children is an empty slot; with children, an operator not chosen yet (nest: `NewUndefinedAstNode({ children: [node, NewUndefinedAstNode()] })`).
- Menu options and copied nodes are `IdLessAstNode`; insert them through `injectIdToNode`.

## Paths

Paths start at `root` (`root.children.0.namedChildren.value`); `parsePath` (`@app-builder/utils/tree`) throws otherwise. Inside an edit modal, `root` is the edited node.

## Updating nodes

The store node is a deep signal: mutating `nodeSharp.value.node` (never a copy) re-renders.

- **Replace at a path**: `nodeSharp.actions.setNodeAtPath(path, newNode)`; it calls `onUpdate` itself.
- **In-place edits** (push/splice children, set `namedChildren`, change `name`): mutate, then `triggerUpdate()` so the host's `onUpdate` sees it. `nodeSharp.update(() => {...})` batches the writes (subscribed components re-render once) but doesn't call `onUpdate`. Reference: `setOperator` in `edition/EditionNode.tsx`.
- `validate()` after every committed change. `onReplaceNode` (ValueSwitch live drafts) skips validation on purpose.
- A modal store has no `onUpdate`: mutate, then `validate()`.

**ValueSwitch lock**: while a ValueSwitch is open every other control is disabled, so new interactive controls must read `AstBuilderDataSharpFactory.select((s) => s.isValueSwitchOpen)` and disable themselves.

## Edit modals

Editable nodes open through the `match` in `edition/EditModal/EditModal.tsx`; ValueSwitch is edited inline. `OperandEditModal` creates a nested store, `useRoot({ node, validation }, false)`, holding a clone of the edited node; inside, `AstBuilderNodeSharpFactory.useSharp()` returns it, not the rule's store. Template: `modals/IpHasFlag/IpHasFlag.tsx`.

- `nodeSharp.select((s) => s.node as XAstNode)`; on every input assign `node.namedChildren.<key>`, then `validate()`.
- Wrap in `OperandEditModalContainer` (Save sends `nodeSharp.value.node` to `onSave`; Escape and outside clicks don't close).
- Errors: `<EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />`; child status via `getValidationStatus`.
- For a complex sub-structure, convert to an edit model and back (`modals/Aggregation/edit-model.ts`).

## Validation flow

- `useRoot` validates through `useValidateAstMutation` (`queries/validate-ast.ts`) and calls `onValidationUpdate` (empty without `scenarioId`) before the store's `validation` is set. Edition roots validate on mount; modals don't.
- It aborts the previous `AbortController`, but `ac` never reaches `validateAstFn`: a stale response can still overwrite the store's `validation` and reach `onValidationUpdate` out of order.
- Validation is flat (`generateFlatEvaluation` in `server-fns/scenarios.ts`): one row per node with `nodeId` and `relatedIds` (the node plus its ancestors, cut at the nearest operand). Leaf operands with child errors get a synthetic `FUNCTION_ERROR`.
- `getErrorsForNode(validation, id, true)` and `EditionEvaluationErrors direct` match `nodeId` only; without `direct`, `relatedIds`.
- View mode: the caller builds validation (`generateFlatEvaluation` in `Decisions/RulesDetail.tsx`).

## Adding a new operator

1. Add it to `binaryMainAstOperatorFunctions` or `unaryMainAstOperatorFunctions` in `models/astNode/builder-ast-node-node-operator.ts`.
2. Add a key to `allMainAstOperatorFunctionsOptions` in `edition/EditionNode.tsx` (key order = dropdown order).
3. Add a case in `models/get-operator-name.ts` (exhaustive via `assertNever`).
4. Add any `scenarios:operator.<key>` to `locales/{en,fr,ar}/scenarios.json`.

## Creating a new editable node type

1. Interface, `NewXAstNode` and `isX` in `models/astNode/<kind>.ts`.
2. Add it to both the `EditableAstNode` union and `isEditableAstNode` (`builder-ast-node.ts`); the guard decides what is a leaf operand. `.exhaustive()` in `EditModal.tsx` only enforces union members, and the two have drifted: TimestampExtract is only in the guard, FuzzyMatchFilterOptions (modal-only sub-node) only in the union.
3. Modal in `edition/EditModal/modals/<X>/` + `.when(isX, ...)` in `EditModal.tsx`.
4. Menu entry in `edition/base-options.ts`, then `services/ast-node/getAstNodeDisplayName.ts`, `getAstNodeDataType.ts`, `getAstNodeOperandType.ts`, `OperandInfos.tsx`. TypeScript doesn't enforce these (a missed one hides the node or shows it as unknown); grep `IpHasFlag` for every touch point.

## Data accessor fields

Use `isEnumField(field)` / `resolveEnumValues(field).values` (`@app-builder/models/enum-values`), never `field.isEnum`: it misses semantic-type enums.

## Testing

Copy the harness in `modals/Aggregation/EditFilters.spec.tsx`.
