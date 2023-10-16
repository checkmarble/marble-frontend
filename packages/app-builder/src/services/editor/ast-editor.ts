import {
  type AstNode,
  type AstOperator,
  type ConstantType,
  type EditorIdentifiersByType,
  type EvaluationError,
  findDataModelTableByName,
  type NodeEvaluation,
  type TableModel,
} from '@app-builder/models';
import { type CustomList } from '@marble-api';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';

import { findAndReplaceNode } from './FindAndReplaceNode';

// TODO: trancher entre Builder vs Editor
export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  validation: { errors: EvaluationError[] };
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
  parent: EditorNodeViewModel | null;
}

export function adaptEditorNodeViewModel({
  ast,
  validation,
  parent,
}: {
  ast: AstNode;
  validation?: NodeEvaluation;
  parent?: EditorNodeViewModel;
}): EditorNodeViewModel {
  const evaluation = validation ?? {
    returnValue: null,
    errors: null,
    children: [],
    namedChildren: {},
  };

  const currentNode: EditorNodeViewModel = {
    nodeId: nanoid(),
    parent: parent ?? null,
    funcName: ast.name,
    constant: ast.constant,
    validation: { errors: evaluation.errors ?? [] },
    children: [],
    namedChildren: {},
  };
  currentNode.children = ast.children.map((child, i) =>
    adaptEditorNodeViewModel({
      ast: child,
      validation: evaluation.children[i],
      parent: currentNode,
    })
  );
  currentNode.namedChildren = R.mapValues(
    ast.namedChildren,
    (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.namedChildren[namedKey],
        parent: currentNode,
      })
  );

  return currentNode;
}

export function flattenViewModelErrors(
  viewModel: EditorNodeViewModel
): EvaluationError[] {
  return [
    ...viewModel.validation.errors,
    ...viewModel.children.flatMap(flattenViewModelErrors),
    ...Object.values(viewModel.namedChildren).flatMap(flattenViewModelErrors),
  ];
}

export function hasArgumentIndexErrorsFromParent(
  viewModel: EditorNodeViewModel
): boolean {
  if (!viewModel.parent) return false;
  const childIndex = viewModel.parent.children.findIndex(
    (child) => child.nodeId == viewModel.nodeId
  );
  return viewModel.parent.validation.errors.some(
    (error) => error.argumentIndex == childIndex
  );
}

export function findArgumentIndexErrorsFromParent(
  viewModel: EditorNodeViewModel
): EvaluationError[] {
  if (!viewModel.parent) return [];
  const childIndex = viewModel.parent.children.findIndex(
    (child) => child.nodeId == viewModel.nodeId
  );
  return viewModel.parent.validation.errors.filter(
    (error) => error.argumentIndex == childIndex
  );
}

export function findArgumentNameErrorsFromParent(
  viewModel: EditorNodeViewModel
): EvaluationError[] {
  if (!viewModel.parent) return [];
  const namedChild = R.pipe(
    R.toPairs(viewModel.parent.namedChildren),
    R.find(([_, child]) => child.nodeId == viewModel.nodeId)
  );
  if (!namedChild) return [];
  return viewModel.parent.validation.errors.filter(
    (error) => error.argumentName == namedChild[0]
  );
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
  dataModel: TableModel[];
  customLists: CustomList[];
  triggerObjectTable: TableModel;
  setConstant: (nodeId: string, newValue: ConstantType) => void;
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
}

export function useAstBuilder({
  backendAst,
  backendValidation,
  localValidation,
  identifiers,
  operators,
  dataModel,
  customLists,
  triggerObjectType,
  onValidate,
}: {
  backendAst: AstNode;
  backendValidation: NodeEvaluation;
  localValidation: NodeEvaluation | null;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
  dataModel: TableModel[];
  customLists: CustomList[];
  triggerObjectType: string;
  onValidate: (ast: AstNode) => void;
}): AstBuilder {
  const [editorNodeViewModel, setEditorNodeViewModel] =
    useState<EditorNodeViewModel>(() => {
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

  useEffect(() => {
    validate(editorNodeViewModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null
    ) => {
      const newViewModel = findAndReplaceNode(nodeId, fn, editorNodeViewModel);
      if (newViewModel === null) {
        throw Error("internal error: root node can't be removed");
      }
      // Validate is opaque (depends on external prop onValidate).
      // A setState callback must be pure (no side effects) so we can't do setEditorNodeViewModel(vm => { validate(vm) }).
      // source: https://github.com/facebook/react/issues/22633
      validate(newViewModel);
      setEditorNodeViewModel(newViewModel);
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

    setEditorNodeViewModel((vm) => {
      return updateValidation({
        editorNodeViewModel: vm,
        validation: localValidation,
      });
    });
  }, [localValidation]);

  return {
    editorNodeViewModel,
    identifiers,
    operators,
    dataModel,
    customLists,
    triggerObjectTable: findDataModelTableByName({
      dataModel: dataModel,
      tableName: triggerObjectType,
    }),
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
  };
}

function updateValidation({
  editorNodeViewModel,
  validation,
  parent,
}: {
  editorNodeViewModel: EditorNodeViewModel;
  validation: NodeEvaluation;
  parent?: EditorNodeViewModel;
}): EditorNodeViewModel {
  // Ensure validation is consistent with view model (due to children, namedChildren recursion)
  if (!validation) {
    throw new Error('validation is required');
  }

  const currentNode: EditorNodeViewModel = {
    ...editorNodeViewModel,
    validation: { errors: validation.errors ?? [] },
    parent: parent ?? null,
    children: [],
    namedChildren: {},
  };
  currentNode.children = editorNodeViewModel.children.map((child, i) =>
    updateValidation({
      editorNodeViewModel: child,
      validation: validation.children[i],
      parent: currentNode,
    })
  );
  currentNode.namedChildren = R.mapValues(
    editorNodeViewModel.namedChildren,
    (child, namedKey) =>
      updateValidation({
        editorNodeViewModel: child,
        validation: validation.namedChildren[namedKey],
      })
  );

  return currentNode;
}
