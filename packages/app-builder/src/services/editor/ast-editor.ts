import {
  type AstNode,
  type AstOperator,
  type ConstantType,
  type DatabaseAccessAstNode,
  type EvaluationError,
  findDataModelTableByName,
  functionNodeNames,
  type NodeEvaluation,
  type PayloadAstNode,
  separateChildrenErrors,
  type TableModel,
} from '@app-builder/models';
import {
  isOperatorFunctions,
  type OperatorFunctions,
} from '@app-builder/models/editable-operators';
import { type CustomList } from 'marble-api';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as R from 'remeda';

import { findAndReplaceNode } from './FindAndReplaceNode';

// TODO: trancher entre Builder vs Editor
export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  errors: EvaluationError[];
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
    errors: [],
    children: [],
    namedChildren: {},
  };

  const currentNode: EditorNodeViewModel = {
    nodeId: nanoid(),
    parent: parent ?? null,
    funcName: ast.name,
    constant: ast.constant,
    errors: computeEvaluationErrors(ast.name, evaluation),
    children: [],
    namedChildren: {},
  };

  currentNode.children = ast.children.map((child, i) =>
    adaptEditorNodeViewModel({
      ast: child,
      validation: evaluation.children[i],
      parent: currentNode,
    }),
  );
  currentNode.namedChildren = R.mapValues(
    ast.namedChildren,
    (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        validation: evaluation.namedChildren[namedKey],
        parent: currentNode,
      }),
  );

  return currentNode;
}

type ValidationViewModel = {
  nodeId: string;
  errors: EvaluationError[];
  children: ValidationViewModel[];
  namedChildren: Record<string, ValidationViewModel>;
  parent: ValidationViewModel | null;
};

export function hasArgumentIndexErrorsFromParent<
  VM extends ValidationViewModel,
>(viewModel: VM): boolean {
  if (!viewModel.parent) return false;
  const childIndex = viewModel.parent.children.findIndex(
    (child) => child.nodeId == viewModel.nodeId,
  );
  return viewModel.parent.errors.some(
    (error) => error.argumentIndex == childIndex,
  );
}

export function findArgumentIndexErrorsFromParent<
  VM extends ValidationViewModel,
>(viewModel: VM): EvaluationError[] {
  if (!viewModel.parent) return [];
  const childIndex = viewModel.parent.children.findIndex(
    (child) => child.nodeId == viewModel.nodeId,
  );
  return viewModel.parent.errors.filter(
    (error) => error.argumentIndex == childIndex,
  );
}

export function hasArgumentNameErrorsFromParent<VM extends ValidationViewModel>(
  viewModel: VM,
): boolean {
  if (!viewModel.parent) return false;
  const namedChild = R.pipe(
    R.toPairs(viewModel.parent.namedChildren),
    R.find(([_, child]) => child.nodeId == viewModel.nodeId),
  );
  if (!namedChild) return false;
  return viewModel.parent.errors.some(
    (error) => error.argumentName == namedChild[0],
  );
}

export function findArgumentNameErrorsFromParent<
  VM extends ValidationViewModel,
>(viewModel: VM): EvaluationError[] {
  if (!viewModel.parent) return [];
  const namedChild = R.pipe(
    R.toPairs(viewModel.parent.namedChildren),
    R.find(([_, child]) => child.nodeId == viewModel.nodeId),
  );
  if (!namedChild) return [];
  return viewModel.parent.errors.filter(
    (error) => error.argumentName == namedChild[0],
  );
}

export function getBorderColor<VM extends ValidationViewModel>(viewModel: VM) {
  if (viewModel.errors.length > 0) return 'red-100';

  if (
    hasArgumentIndexErrorsFromParent(viewModel) ||
    hasArgumentNameErrorsFromParent(viewModel)
  )
    return 'red-25';

  return 'grey-10';
}

// adapt ast node from editor view model
export function adaptAstNodeFromEditorViewModel(
  vm: EditorNodeViewModel,
): AstNode {
  return {
    name: vm.funcName,
    constant: vm.constant,
    children: vm.children.map(adaptAstNodeFromEditorViewModel),
    namedChildren: R.mapValues(
      vm.namedChildren,
      adaptAstNodeFromEditorViewModel,
    ),
  };
}

export interface AstBuilder {
  editorNodeViewModel: EditorNodeViewModel;
  setConstant: (nodeId: string, newValue: ConstantType) => void;
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunctions[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
  };
}

export function useAstBuilder({
  backendAst,
  backendValidation,
  localValidation,
  databaseAccessors,
  payloadAccessors,
  astOperators,
  dataModel,
  customLists,
  triggerObjectType,
  onValidate,
}: {
  backendAst: AstNode;
  backendValidation: NodeEvaluation;
  localValidation: NodeEvaluation | null;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  astOperators: AstOperator[];
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
    [onValidate],
  );

  useEffect(() => {
    validate(editorNodeViewModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replaceOneNode = useCallback(
    (
      nodeId: string,
      fn: (node: EditorNodeViewModel) => EditorNodeViewModel | null,
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
    [editorNodeViewModel, validate],
  );

  const setConstant = useCallback(
    (nodeId: string, newValue: ConstantType) => {
      replaceOneNode(nodeId, (node) => ({
        ...node,
        constant: newValue,
      }));
    },
    [replaceOneNode],
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
    [replaceOneNode],
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
    [replaceOneNode],
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
    [replaceOneNode],
  );

  const remove = useCallback(
    (nodeId: string) => replaceOneNode(nodeId, () => null),
    [replaceOneNode],
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

  const operators = useMemo(
    () =>
      R.pipe(
        astOperators,
        R.map((op) => op.name),
        R.filter(isOperatorFunctions),
      ),
    [astOperators],
  );

  return {
    editorNodeViewModel,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
    input: {
      databaseAccessors,
      payloadAccessors,
      operators: operators,
      dataModel,
      customLists,
      triggerObjectTable: findDataModelTableByName({
        dataModel: dataModel,
        tableName: triggerObjectType,
      }),
    },
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
    errors: computeEvaluationErrors(editorNodeViewModel.funcName, validation),
    parent: parent ?? null,
    children: [],
    namedChildren: {},
  };
  currentNode.children = editorNodeViewModel.children.map((child, i) =>
    updateValidation({
      editorNodeViewModel: child,
      validation: validation.children[i],
      parent: currentNode,
    }),
  );
  currentNode.namedChildren = R.mapValues(
    editorNodeViewModel.namedChildren,
    (child, namedKey) =>
      updateValidation({
        editorNodeViewModel: child,
        validation: validation.namedChildren[namedKey],
        parent: currentNode,
      }),
  );

  return currentNode;
}

function computeEvaluationErrors(
  funcName: EditorNodeViewModel['funcName'],
  validation: NodeEvaluation,
): EvaluationError[] {
  const errors: EvaluationError[] = [];
  if (validation.errors) {
    errors.push(...validation.errors);
  }
  if (
    funcName &&
    functionNodeNames.includes(funcName) &&
    hasNestedErrors(validation)
  ) {
    errors.push({ error: 'FUNCTION_ERROR', message: 'function has error' });
  }

  return errors;
}

/**
 * A nested error is:
 * - a childError or a namedChildError of root NodeEvaluation["errors"]
 * - any error on the NodeEvaluation["children"] or NodeEvaluation["namedChildren"]
 *
 * In other words, an error of the root NodeEvaluation["errors"] without argumentIndex or argumentName is not a nested error
 *
 * Exemples:
 * - ❌ { errors: [{ error: 'FUNCTION_ERROR', message: 'function has error' }] }
 * - ✅ { errors: [{ argumentIndex: 2, ...}] }
 * - ✅ { errors: [{ argumentName: "label", ...}] }
 * - ✅ { errors: [], children: { errors: [{...}]} }
 * - ✅ { errors: [], namedChildren: { errors: [{...}] } }
 */
function hasNestedErrors(validation: NodeEvaluation, root = true): boolean {
  let errors: EvaluationError[];
  if (root) {
    const { namedChildrenErrors, nodeErrors } = separateChildrenErrors(
      validation.errors,
    );
    errors = [...namedChildrenErrors, ...nodeErrors];
  } else {
    errors = validation.errors;
  }

  if (errors.length > 0) {
    return true;
  }

  const children = [
    ...validation.children,
    ...Object.values(validation.namedChildren),
  ];
  if (
    children.some((childValidation) => hasNestedErrors(childValidation, false))
  ) {
    return true;
  }

  return false;
}
