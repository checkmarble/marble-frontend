import {
  type AstNode,
  type ConstantType,
  functionNodeNames,
} from '@app-builder/models';
import {
  type EvaluationError,
  NewNodeEvaluation,
  type NodeEvaluation,
  separateChildrenErrors,
} from '@app-builder/models/node-evaluation';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import * as R from 'remeda';

import { type ReturnValue } from '../ast-node/return-value';
import { findAndReplaceNode } from './FindAndReplaceNode';

export interface EditorNodeViewModel {
  nodeId: string;
  funcName: string | null;
  constant?: ConstantType;
  errors: EvaluationError[];
  children: EditorNodeViewModel[];
  namedChildren: Record<string, EditorNodeViewModel>;
  parent: EditorNodeViewModel | null;
  returnValue?: ReturnValue;
}

export function adaptEditorNodeViewModel({
  ast,
  evaluation = NewNodeEvaluation(),
  parent,
}: {
  ast: AstNode;
  evaluation?: NodeEvaluation;
  parent?: EditorNodeViewModel;
}): EditorNodeViewModel {
  const currentNode: EditorNodeViewModel = {
    nodeId: nanoid(),
    parent: parent ?? null,
    funcName: ast.name,
    constant: ast.constant,
    errors: computeEvaluationErrors(ast.name, evaluation),
    children: [],
    namedChildren: {},
    returnValue: evaluation.returnValue,
  };

  currentNode.children = ast.children.map((child, i) =>
    adaptEditorNodeViewModel({
      ast: child,
      evaluation: evaluation.children[i],
      parent: currentNode,
    }),
  );
  currentNode.namedChildren = R.mapValues(
    ast.namedChildren,
    (child, namedKey) =>
      adaptEditorNodeViewModel({
        ast: child,
        evaluation: evaluation.namedChildren[namedKey],
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

export function getValidationStatus<VM extends ValidationViewModel>(
  viewModel: VM,
) {
  if (viewModel.errors.length > 0) return 'error';

  if (
    hasArgumentIndexErrorsFromParent(viewModel) ||
    hasArgumentNameErrorsFromParent(viewModel)
  )
    return 'light-error';

  return 'valid';
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
}

export function useAstBuilder({
  backendAst,
  backendEvaluation,
  localEvaluation,
  onValidate,
}: {
  backendAst: AstNode;
  backendEvaluation?: NodeEvaluation;
  localEvaluation: NodeEvaluation | null;
  onValidate: (ast: AstNode) => void;
}): AstBuilder {
  const [editorNodeViewModel, setEditorNodeViewModel] =
    useState<EditorNodeViewModel>(() => {
      return adaptEditorNodeViewModel({
        ast: backendAst,
        evaluation: backendEvaluation,
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
    if (localEvaluation === null) {
      return;
    }

    setEditorNodeViewModel((vm) => {
      return updateEvaluation({
        editorNodeViewModel: vm,
        evaluation: localEvaluation,
      });
    });
  }, [localEvaluation]);

  return {
    editorNodeViewModel,
    setConstant,
    setOperand,
    setOperator,
    appendChild,
    remove,
  };
}

function updateEvaluation({
  editorNodeViewModel,
  evaluation,
  parent,
}: {
  editorNodeViewModel: EditorNodeViewModel;
  evaluation: NodeEvaluation;
  parent?: EditorNodeViewModel;
}): EditorNodeViewModel {
  // Ensure validation is consistent with view model (due to children, namedChildren recursion)
  if (!evaluation) {
    throw new Error('validation is required');
  }

  const currentNode: EditorNodeViewModel = {
    ...editorNodeViewModel,
    errors: computeEvaluationErrors(editorNodeViewModel.funcName, evaluation),
    parent: parent ?? null,
    children: [],
    namedChildren: {},
  };
  currentNode.children = editorNodeViewModel.children.map((child, i) =>
    updateEvaluation({
      editorNodeViewModel: child,
      evaluation: evaluation.children[i],
      parent: currentNode,
    }),
  );
  currentNode.namedChildren = R.mapValues(
    editorNodeViewModel.namedChildren,
    (child, namedKey) =>
      updateEvaluation({
        editorNodeViewModel: child,
        evaluation: evaluation.namedChildren[namedKey],
        parent: currentNode,
      }),
  );

  return currentNode;
}

function computeEvaluationErrors(
  funcName: EditorNodeViewModel['funcName'],
  evaluation: NodeEvaluation,
): EvaluationError[] {
  const errors: EvaluationError[] = [];
  if (evaluation.errors) {
    errors.push(...evaluation.errors);
  }

  //TODO(validation): refactor to move this on a "getError(nodeId)" function (this is a internal business logic specificity of the editor)
  if (
    funcName &&
    functionNodeNames.includes(funcName) &&
    hasNestedErrors(evaluation)
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
function hasNestedErrors(evaluation: NodeEvaluation, root = true): boolean {
  let errors: EvaluationError[];
  if (root) {
    const { namedChildrenErrors, nodeErrors } = separateChildrenErrors(
      evaluation.errors,
    );
    errors = [...namedChildrenErrors, ...nodeErrors];
  } else {
    errors = evaluation.errors;
  }

  if (errors.length > 0) {
    return true;
  }

  const children = [
    ...evaluation.children,
    ...Object.values(evaluation.namedChildren),
  ];
  if (
    children.some((childValidation) => hasNestedErrors(childValidation, false))
  ) {
    return true;
  }

  return false;
}
