---
name: ast-builder-developer
description: AST Builder component patterns for Marble's rule/condition builder. Use when working with AstBuilder components, editing AST nodes, node state management with sharpstate, validation flows, or any rule builder UI. Covers Provider/Root patterns, edition vs viewing modes, node types (And, Or, Main, Operand), EditModal system, and path-based navigation.
---

# AST Builder Developer Guide

## Purpose

Comprehensive guide for working with the AstBuilder component system - Marble's visual rule and condition builder. This system allows users to create complex logical expressions using a visual UI.

## When to Use This Skill

Automatically activates when you mention:
- AstBuilder components
- Rule builder / condition builder
- AST nodes or node types
- Edition mode / viewing mode
- Node validation
- Operand editing
- sharpstate in AstBuilder context

---

## Architecture Overview

```
AstBuilder/
  index.tsx           # Exports: Root, Operand, Provider, EditModal
  Provider.tsx        # AstBuilderDataSharpFactory - holds builder options
  Root.tsx            # Routes to edition/viewing based on mode
  Operand.tsx         # Operand display component
  types.ts            # Type definitions

  edition/            # Edit mode components
    node-store.ts     # AstBuilderNodeSharpFactory - node state
    EditionNode.tsx   # Main editing node component
    EditionOperand.tsx
    EditionAndRoot.tsx
    EditionOrWithAndRoot.tsx
    EditModal/        # Modal for special node types
      modals/         # Aggregation, FuzzyMatch, TimeAdd, etc.

  viewing/            # View mode components
    ViewingNode.tsx
    ViewingOperand.tsx
    ViewingAndRoot.tsx
```

---

## Core Concepts

### Two State Factories

**1. AstBuilderDataSharpFactory** (Provider.tsx)
- Holds scenario data, builder options, mode
- Created once per AstBuilder instance
- Provides: `dataModel`, `triggerObjectType`, `mode`, `showValues`

```typescript
const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
const data = AstBuilderDataSharpFactory.useSharp().value.$data!.value;
```

**2. AstBuilderNodeSharpFactory** (node-store.ts)
- Holds current node state, validation, actions
- Created per Root component
- Actions: `setNodeAtPath`, `validate`, `copyNode`, `triggerUpdate`

```typescript
const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
nodeSharp.actions.setNodeAtPath(path, newNode);
nodeSharp.actions.validate();
```

### Modes

| Mode | Purpose | Components |
|------|---------|------------|
| `edit` | User can modify nodes | `EditionAstBuilder*` |
| `view` | Read-only display | `ViewingAstBuilder*` |

---

## Node Types

### Logical Structure Nodes

```typescript
// AND node - groups conditions
interface AndAstNode {
  id: string;
  name: 'And';
  children: AstNode[];
  namedChildren: Record<string, never>;
}

// OR with AND children - top-level structure
interface OrWithAndAstNode {
  id: string;
  name: 'Or';
  children: AndAstNode[];
  namedChildren: Record<string, never>;
}
```

### Operator Nodes

```typescript
// Binary operators: =, ≠, <, <=, >, >=, +, -, *, /, IsInList, etc.
interface MainAstBinaryNode {
  id: string;
  name: BinaryMainAstOperatorFunction;
  children: [AstNode, AstNode];  // Left and right operands
}

// Unary operators: IsEmpty, IsNotEmpty
interface MainAstUnaryNode {
  id: string;
  name: UnaryMainAstOperatorFunction;
  children: [AstNode];  // Single operand
}
```

### Operand Nodes (KnownOperandAstNode)

| Type | Description | Example |
|------|-------------|---------|
| `UndefinedAstNode` | Empty placeholder | New condition slot |
| `ConstantAstNode` | Literal value | `"hello"`, `42`, `true` |
| `DataAccessorAstNode` | Field reference | `transaction.amount` |
| `CustomListAccessAstNode` | List reference | `blockedCountries` |
| `EditableAstNode` | Complex nodes | Aggregation, FuzzyMatch |

### Editable Nodes (Modal-based)

These nodes require a dedicated EditModal:
- `AggregationAstNode` - Count, Sum, Avg operations
- `TimeAddAstNode` - Date arithmetic
- `FuzzyMatchComparatorAstNode` - Fuzzy string matching
- `IsMultipleOfAstNode` - Divisibility check
- `StringTemplateAstNode` - String interpolation

---

## Path-Based Navigation

Nodes are accessed via path strings:

```typescript
import { getAtPath, parsePath, getParentPath } from '@app-builder/utils/tree';

// Get node at path
const node = getAtPath(rootNode, parsePath('children.0.children.1'));

// Get parent path
const parentPath = getParentPath(parsePath('children.0.children.1'));
// Result: { path: 'children.0', childPathSegment: { type: 'children', index: 1 } }
```

**Path format:**
- `children.0` - First child
- `children.1.children.0` - First grandchild of second child
- `namedChildren.left` - Named child 'left'

---

## Component Patterns

### Using AstBuilder

```typescript
import { AstBuilder } from '@app-builder/components/AstBuilder';

// Full setup with Provider
<AstBuilder.Provider scenarioId={scenarioId} mode="edit">
  <AstBuilder.Root
    node={astNode}
    validation={validation}
    onUpdate={(node) => handleUpdate(node)}
    onValidationUpdate={(v) => setValidation(v)}
  />
</AstBuilder.Provider>
```

### EditionNode Pattern

The `EditionAstBuilderNode` uses `ts-pattern` to route rendering:

```typescript
match(node.value)
  .when(isMainAstBinaryNode, (node) => {
    // Render binary operator with left/right children
    return (
      <>
        <EditionAstBuilderNode path={`${path}.children.0`} />
        <OperatorSelect operator={node.name} onOperatorChange={setOperator} />
        <EditionAstBuilderNode path={`${path}.children.1`} />
      </>
    );
  })
  .when(isMainAstUnaryNode, (node) => {
    // Render unary operator with single child
  })
  .when(isKnownOperandAstNode, (node) => {
    // Render operand (leaf node)
    return <EditionAstBuilderOperand node={node} onChange={setNode} />;
  })
  .otherwise(() => <NodeTypeError />);
```

### Updating Nodes

```typescript
const nodeSharp = AstBuilderNodeSharpFactory.useSharp();

// Update node at path
const setNode = (newNode: AstNode) => {
  nodeSharp.actions.setNodeAtPath(props.path, newNode);
  nodeSharp.actions.validate();
};

// Update operator only
const setOperator = (operator: string) => {
  node.value.name = operator;
  // Adjust children count for unary/binary
  if (isUnaryMainAstOperatorFunction(operator) && node.value.children.length > 1) {
    node.value.children = [node.value.children[0]!];
  }
  nodeSharp.actions.triggerUpdate();
  nodeSharp.actions.validate();
};
```

---

## Type Guards

Always use type guards before accessing node properties:

```typescript
import {
  isAndAstNode,
  isOrWithAndAstNode,
  isMainAstNode,
  isMainAstBinaryNode,
  isMainAstUnaryNode,
  isKnownOperandAstNode,
  isEditableAstNode,
} from '@app-builder/models/astNode/builder-ast-node';

import { isConstant } from '@app-builder/models/astNode/constant';
import { isDataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { isAggregation } from '@app-builder/models/astNode/aggregation';
```

---

## Validation Flow

```typescript
// 1. Node store has validation function
const nodeStore = AstBuilderNodeSharpFactory.createSharp({
  initialNode: node,
  initialValidation: validation,
  validationFn: async (node) => {
    // Call API to validate
    return await validateAst(scenarioId, node);
  },
  updateFn: (node) => onUpdate(node),
});

// 2. After changes, trigger validation
nodeSharp.actions.setNodeAtPath(path, newNode);
nodeSharp.actions.validate();

// 3. Get errors for specific node
import { getErrorsForNode } from './edition/helpers';
const errors = getErrorsForNode(validation, node.id, true);
const hasError = errors.length > 0;
```

---

## Common Tasks

### Adding a New Operator

1. Add to `builder-ast-node-node-operator.ts`
2. Update `allMainAstOperatorFunctionsOptions` in `EditionNode.tsx`
3. Add i18n translation in `scenarios` namespace

### Creating a New Editable Node Type

1. Define interface in `models/astNode/`
2. Add type guard function
3. Update `isEditableAstNode` in `builder-ast-node.ts`
4. Create modal in `edition/EditModal/modals/`
5. Register in `EditModal.tsx`

### Working with Data Accessors

```typescript
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';

if (isDataAccessorAstNode(node)) {
  const field = getDataAccessorAstNodeField(node, {
    dataModel: data.dataModel,
    triggerObjectTable: triggerTable,
  });
  // field.isEnum, field.values, field.dataType, etc.
}
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `components/AstBuilder/index.tsx` | Main exports |
| `components/AstBuilder/Provider.tsx` | Data provider factory |
| `components/AstBuilder/Root.tsx` | Entry point, mode routing |
| `components/AstBuilder/edition/node-store.ts` | Node state management |
| `components/AstBuilder/edition/EditionNode.tsx` | Main editing component |
| `components/AstBuilder/edition/EditionOperand.tsx` | Operand editing |
| `models/astNode/builder-ast-node.ts` | Node types & guards |
| `models/astNode/builder-ast-node-node-operator.ts` | Operator definitions |
| `utils/tree.ts` | Path navigation utilities |

---

## Best Practices

1. **Always validate after changes** - Call `nodeSharp.actions.validate()` after any node modification
2. **Use type guards** - Never assume node type, always check with `is*` functions
3. **Use ts-pattern** - For node type routing, use `match().when().otherwise()`
4. **Clone before mutating** - Use `clone()` from remeda when needed
5. **Path-based updates** - Use `setNodeAtPath` instead of direct mutation
6. **Handle both modes** - Check if component needs to support edit AND view modes

---

## Troubleshooting

### Node not updating visually
- Ensure `validate()` is called after `setNodeAtPath()`
- Check if `triggerUpdate()` is needed for operator changes

### Validation not showing errors
- Verify `getErrorsForNode()` is called with correct node ID
- Check if validation response contains the expected structure

### Type errors with node properties
- Use appropriate type guard before accessing properties
- Check if node type matches expected interface

---

**Skill Status**: Initial version for Marble AstBuilder
