import {
  adaptValidation,
  type AstNode,
  type AstOperator,
  type ConstantType,
  type EditorIdentifiersByType,
  type NodeEvaluation,
  type Validation,
  wrapInOrAndGroups,
} from '@app-builder/models';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';

// TODO: trancher entre Builder vs Editor
export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  validation: Validation;
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
}

function adaptEditorNodeViewModel({
  ast,
  validation,
}: {
  ast: AstNode;
  validation?: NodeEvaluation;
}): EditorNodeViewModel {
  if (
    validation !== undefined &&
    ast.children.length !== validation.children.length
  ) {
    console.error('ast.children.length !== evaluation.children.length');
    // throw new Error('ast.children.length !== evaluation.children.length');
  }

  let evaluation: NodeEvaluation;

  if (validation === undefined) {
    evaluation = {
      returnValue: null,
      errors: null,
      children: [],
      namedChildren: {},
    };
  } else {
    evaluation = validation;
  }

  return {
    nodeId: nanoid(),
    funcName: ast.name,
    constant: ast.constant,
    validation: adaptValidation(evaluation),
    children: ast.children.map((child, i) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.children[i],
      })
    ),
    namedChildren: R.mapValues(ast.namedChildren, (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.namedChildren[namedKey],
      })
    ),
  };
}

// adapt ast node from editor view model
export function adaptAstNodeFromEditorViewModel(
  vm: EditorNodeViewModel
): AstNode {
  return {
    name: vm.funcName,
    constant: vm.constant,
    children: vm.children.map(adaptAstNodeFromEditorViewModel),
    namedChildren: R.mapValues(
      vm.namedChildren,
      adaptAstNodeFromEditorViewModel
    ),
  };
}

export interface AstBuilder {
  editorNodeViewModel: EditorNodeViewModel;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  setConstant(nodeId: string, newValue: ConstantType): void;
  setOperand(nodeId: string, operandAst: AstNode): void;
  setOperator(nodeId: string, name: string): void;
  appendChild(nodeId: string, childAst: AstNode): void;
  remove(nodeId: string): void;
  save(): void;
}

export function useAstBuilder({
  backendAst,
  backendValidation,
  localValidation,
  identifiers,
  operators,
  onSave,
  onValidate,
}: {
  backendAst: AstNode | null;
  backendValidation: NodeEvaluation;
  localValidation: NodeEvaluation | null;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  onSave: (toSave: AstNode) => void;
  onValidate: (ast: AstNode) => void;
}): AstBuilder {
  const [editorNodeViewModel, setEditorNodeViewModel] =
    useState<EditorNodeViewModel>(() => {
      if (backendAst === null) {
        // return default rule, ignore backend validation
        const vm = adaptEditorNodeViewModel({
          ast: wrapInOrAndGroups(),
          validation: undefined,
        });
        validate(vm);
        return vm;
      }

      return adaptEditorNodeViewModel({
        ast: backendAst,
        validation: backendValidation,
      });
    });

  const validate = useCallback(
    (vm: EditorNodeViewModel) => {
      const editedAst = adaptAstNodeFromEditorViewModel(vm);
      onValidate(editedAst);
    },
    [onValidate]
  );

  // replace the node
  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null
    ) => {
      const newViewModel = findAndReplaceNode(nodeId, fn, editorNodeViewModel);
      if (newViewModel === null) {
        throw Error("internal error: root node can't be removed");
      }
      setEditorNodeViewModel(newViewModel);
      validate(newViewModel);
    },
    [editorNodeViewModel, validate]
  );

  const setConstant = useCallback(
    (nodeId: string, newValue: ConstantType) => {
      replaceOneNode(nodeId, (node) => ({
        ...node,
        constant: newValue,
      }));
    },
    [replaceOneNode]
  );

  const setOperand = useCallback(
    (nodeId: string, operandAst: AstNode) => {
      replaceOneNode(nodeId, () => {
        const newOperand = adaptEditorNodeViewModel({
          ast: operandAst,
        });

        return newOperand;
      });
    },
    [replaceOneNode]
  );

  const setOperator = useCallback(
    (nodeId: string, funcName: string) => {
      replaceOneNode(nodeId, (node) => {
        return {
          ...node,
          funcName,
        };
      });
    },
    [replaceOneNode]
  );

  const appendChild = useCallback(
    (nodeId: string, childAst: AstNode) => {
      replaceOneNode(nodeId, (node) => {
        const newChild = adaptEditorNodeViewModel({
          ast: childAst,
        });

        return {
          ...node,
          children: [...node.children, newChild],
        };
      });
    },
    [replaceOneNode]
  );

  const remove = useCallback(
    (nodeId: string) => replaceOneNode(nodeId, () => null),
    [replaceOneNode]
  );

  useEffect(() => {
    if (localValidation === null) {
      return;
    }

    // use local viewmodel
    // TODO: no need to replace the astViewModel: just merge the localValidation

    setEditorNodeViewModel((vm) => {
      const editedAst = adaptAstNodeFromEditorViewModel(vm);
      return adaptEditorNodeViewModel({
        ast: editedAst,
        validation: localValidation,
      });
    });
  }, [localValidation]);

  const save = useCallback(() => {
    const newAst = adaptAstNodeFromEditorViewModel(editorNodeViewModel);
    onSave(newAst);
    validate(editorNodeViewModel);
  }, [editorNodeViewModel, onSave, validate]);

  return {
    editorNodeViewModel,
    identifiers,
    operators,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
    save,
  };
}

// Find the node `nodeIdToReplace` by walking the tree bottom-up
// When found, apply `fn` to the node and replace the node with the result
// If fn return null, the node is removed.
function findAndReplaceNode(
  nodeIdToReplace: string,
  fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null,
  node: EditorNodeViewModel
): EditorNodeViewModel | null {
  if (node.nodeId === nodeIdToReplace) {
    return fn(node);
  }

  const children = R.pipe(
    node.children,
    R.map((child) => findAndReplaceNode(nodeIdToReplace, fn, child)),
    R.compact
  );

  const namedChildren = R.pipe(
    R.toPairs(node.namedChildren),
    R.map(([key, child]) => {
      const newChild = findAndReplaceNode(nodeIdToReplace, fn, child);
      return newChild === null ? null : ([key, newChild] as const);
    }),
    R.compact,
    (pairs) => R.fromPairs(pairs)
  );

  return {
    ...node,
    children,
    namedChildren,
  };
}
