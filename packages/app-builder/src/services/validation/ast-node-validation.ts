import * as React from 'react';
import { isLeafOperandAstNode } from '@app-builder/models';
import {
  type AstNodeViewModel,
  type ValidationViewModel,
} from '@app-builder/models/ast-node-view-model';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import * as R from 'remeda';
import invariant from 'tiny-invariant';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
  useGetOrAndNodeEvaluationErrorMessage,
} from './scenario-validation-error-messages';

export function getAstNodeEvaluationErrors(
  astNodeVM: AstNodeViewModel,
): EvaluationError[] {
  const errors: EvaluationError[] = [];
  if (astNodeVM.errors) {
    errors.push(...astNodeVM.errors);
  }

  // In case of a leaf node, we create an aggregated error if the node has nested errors,
  // to help the user understand that the node is invalid
  if (isLeafOperandAstNode(astNodeVM) && hasNestedErrors(astNodeVM)) {
    errors.push({ error: 'FUNCTION_ERROR', message: 'function has error' });
  }

  return errors;
}

/**
 * Separate errors into 3 categories:
 * - childrenErrors: errors that are related to a child node
 * - namedChildrenErrors: errors that are related to a named child node
 * - nodeErrors: errors that are related to the node itself
 */
export function separateChildrenErrors(errors: EvaluationError[]) {
  const [childrenErrors, nonChildrenErrors] = R.partition(errors, (error) => {
    return error.argumentIndex != undefined;
  });

  const [namedChildrenErrors, nodeErrors] = R.partition(
    nonChildrenErrors,
    (error) => {
      return error.argumentName != undefined;
    },
  );

  return {
    childrenErrors,
    namedChildrenErrors,
    nodeErrors,
  };
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
function hasNestedErrors(
  validationVM: ValidationViewModel,
  root = true,
): boolean {
  let errors: EvaluationError[];
  if (root) {
    const { namedChildrenErrors, nodeErrors } = separateChildrenErrors(
      validationVM.errors,
    );
    errors = [...namedChildrenErrors, ...nodeErrors];
  } else {
    errors = validationVM.errors;
  }

  if (errors.length > 0) {
    return true;
  }

  const children = [
    ...validationVM.children,
    ...Object.values(validationVM.namedChildren),
  ];
  if (
    children.some((childValidation) => hasNestedErrors(childValidation, false))
  ) {
    return true;
  }

  return false;
}

export function computeValidationForNamedChildren(
  viewModel: AstNodeViewModel,
  namedArgumentKey: string | string[],
): EvaluationError[] {
  let namedArgumentKeys = namedArgumentKey;
  if (typeof namedArgumentKey === 'string') {
    namedArgumentKeys = [namedArgumentKey];
  }
  const errors: EvaluationError[] = [];
  for (const key of namedArgumentKeys) {
    const namedChild = viewModel.namedChildren[key];
    invariant(
      namedChild,
      `${key} is not a valid named argument key of ${viewModel.name}`,
    );

    errors.push(...getAstNodeEvaluationErrors(namedChild));
    errors.push(...findArgumentNameErrorsFromParent(namedChild));
  }
  return errors;
}

export function findArgumentIndexErrorsFromParent(
  viewModel: AstNodeViewModel,
): EvaluationError[] {
  if (!viewModel.parent) return [];
  const childIndex = viewModel.parent.children.findIndex(
    (child) => child.nodeId == viewModel.nodeId,
  );
  const parentErrors = getAstNodeEvaluationErrors(viewModel.parent);
  return parentErrors.filter((error) => error.argumentIndex == childIndex);
}

export function findArgumentNameErrorsFromParent(
  viewModel: AstNodeViewModel,
): EvaluationError[] {
  if (!viewModel.parent) return [];
  const namedChild = R.pipe(
    R.entries(viewModel.parent.namedChildren),
    R.find(([_, child]) => child.nodeId == viewModel.nodeId),
  );
  if (!namedChild) return [];
  const parentErrors = getAstNodeEvaluationErrors(viewModel.parent);
  return parentErrors.filter((error) => error.argumentName == namedChild[0]);
}

export function getValidationStatus(
  viewModel: AstNodeViewModel,
): ValidationStatus {
  const errors = getAstNodeEvaluationErrors(viewModel);
  if (errors.length > 0) return 'error';

  if (
    findArgumentIndexErrorsFromParent(viewModel).length > 0 ||
    findArgumentNameErrorsFromParent(viewModel).length > 0
  )
    return 'light-error';

  return 'valid';
}

export type ValidationStatus = 'valid' | 'error' | 'light-error';

export function computeLineErrors(
  viewModel: AstNodeViewModel,
): EvaluationError[] {
  // Stop the recursion if the node is a leaf
  if (isLeafOperandAstNode(viewModel)) {
    const errors = getAstNodeEvaluationErrors(viewModel);
    const { nodeErrors } = separateChildrenErrors(errors);
    return nodeErrors;
  } else {
    return [
      ...viewModel.errors,
      ...viewModel.children.flatMap(computeLineErrors),
      ...Object.values(viewModel.namedChildren).flatMap(computeLineErrors),
    ];
  }
}

export function useRootAstBuilderValidation() {
  const getOrAndNodeEvaluationErrorMessage =
    useGetOrAndNodeEvaluationErrorMessage();
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const getOrAndErrorMessages = React.useCallback(
    (astNodeVM: AstNodeViewModel) => {
      const { nodeErrors } = separateChildrenErrors(
        getAstNodeEvaluationErrors(astNodeVM),
      );
      return adaptEvaluationErrorViewModels(nodeErrors).map(
        getOrAndNodeEvaluationErrorMessage,
      );
    },
    [getOrAndNodeEvaluationErrorMessage],
  );

  const getOrAndChildValidation = React.useCallback(
    (astNodeVM: AstNodeViewModel) => {
      const argumentIndexErrorsFromParent =
        findArgumentIndexErrorsFromParent(astNodeVM);

      const errorMessages = adaptEvaluationErrorViewModels([
        ...computeLineErrors(astNodeVM),
        ...argumentIndexErrorsFromParent,
      ]).map((error) => getNodeEvaluationErrorMessage(error));

      return {
        errorMessages,
        hasArgumentIndexErrorsFromParent:
          argumentIndexErrorsFromParent.length > 0,
      };
    },
    [getNodeEvaluationErrorMessage],
  );

  return {
    getOrAndErrorMessages,
    getOrAndChildValidation,
  };
}
