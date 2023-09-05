import {
  adaptValidation,
  type AstNode,
  type AstOperator,
  type ConstantType,
  type DataModel,
  type EditorIdentifiersByType,
  type NodeEvaluation,
  type Validation,
  wrapInOrAndGroups,
} from '@app-builder/models';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';

import { findAndReplaceNode } from './FindAndReplaceNode';

// TODO: trancher entre Builder vs Editor
export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  validation: Validation;
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
}

export function adaptEditorNodeViewModel({
  ast,
  validation,
}: {
  ast: AstNode;
  validation?: NodeEvaluation;
}): EditorNodeViewModel {
  const evaluation = validation ?? {
    returnValue: null,
    errors: null,
    children: [],
    namedChildren: {},
  };

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
  dataModels: DataModel[];
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
  dataModels,
  onSave,
  onValidate,
}: {
  backendAst: AstNode | null;
  backendValidation: NodeEvaluation;
  localValidation: NodeEvaluation | null;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  dataModels: DataModel[];
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

  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null
    ) => {
      setEditorNodeViewModel((vm) => {
        const newViewModel = findAndReplaceNode(nodeId, fn, vm);
        if (newViewModel === null) {
          throw Error("internal error: root node can't be removed");
        }
        validate(newViewModel);
        return newViewModel;
      });
    },
    [validate]
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

    setEditorNodeViewModel((vm) => {
      return updateValidation({
        editorNodeViewModel: vm,
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
    dataModels,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
    save,
  };
}

function updateValidation({
  editorNodeViewModel,
  validation,
}: {
  editorNodeViewModel: EditorNodeViewModel;
  validation: NodeEvaluation;
}): EditorNodeViewModel {
  // Ensure validation is consistent with view model (due to children, namedChildren recursion)
  if (!validation) {
    throw new Error('validation is required');
  }

  return {
    ...editorNodeViewModel,
    validation: adaptValidation(validation),
    children: editorNodeViewModel.children.map((child, i) =>
      updateValidation({
        editorNodeViewModel: child,
        validation: validation.children[i],
      })
    ),
    namedChildren: R.mapValues(
      editorNodeViewModel.namedChildren,
      (child, namedKey) =>
        updateValidation({
          editorNodeViewModel: child,
          validation: validation.namedChildren[namedKey],
        })
    ),
  };
}
