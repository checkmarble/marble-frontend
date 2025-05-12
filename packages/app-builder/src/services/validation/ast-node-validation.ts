import type { AstNode } from '@app-builder/models';
import { isLeafOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import type { EvaluationError } from '@app-builder/models/node-evaluation';
import type { PathSegment, Tree } from '@app-builder/utils/tree';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

export type AstNodeErrors = Tree<{ errors: EvaluationError[] }>;

export function getAstNodeEvaluationErrors(
  astNode: AstNode,
  astNodeErrors: AstNodeErrors,
): EvaluationError[] {
  const errors: EvaluationError[] = [];
  if (astNodeErrors.errors) {
    errors.push(...astNodeErrors.errors);
  }

  // In case of a leaf node, we create an aggregated error if the node has nested errors,
  // to help the user understand that the node is invalid
  if (isLeafOperandAstNode(astNode) && hasNestedErrors(astNodeErrors)) {
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

  const [namedChildrenErrors, nodeErrors] = R.partition(nonChildrenErrors, (error) => {
    return error.argumentName != undefined;
  });

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
function hasNestedErrors(astNodeErrors: AstNodeErrors, root = true): boolean {
  let errors: EvaluationError[];
  if (root) {
    const { namedChildrenErrors, nodeErrors } = separateChildrenErrors(astNodeErrors.errors);
    errors = [...namedChildrenErrors, ...nodeErrors];
  } else {
    errors = astNodeErrors.errors;
  }

  if (errors.length > 0) {
    return true;
  }

  const children = [...astNodeErrors.children, ...Object.values(astNodeErrors.namedChildren)];
  if (children.some((childValidation) => hasNestedErrors(childValidation, false))) {
    return true;
  }

  return false;
}

// TODO: should be removed. Depending on the use case, we should use computeLineErrors or alike function (ex: when we have a "MainAstNode" like comp in a modal)
// Ex: if you nest variables, this function is "wrong" because it doesn't separate children errors like computeLineErrors
export function computeValidationForNamedChildren(
  astNode: AstNode,
  astNodeErrors: AstNodeErrors,
  namedArgumentKey: string | string[],
): EvaluationError[] {
  let namedArgumentKeys = namedArgumentKey;
  if (typeof namedArgumentKey === 'string') {
    namedArgumentKeys = [namedArgumentKey];
  }
  const errors: EvaluationError[] = [];
  const parentErrors = getAstNodeEvaluationErrors(astNode, astNodeErrors);
  for (const key of namedArgumentKeys) {
    const namedChild = astNode.namedChildren[key];
    invariant(namedChild, `${key} is not a valid named argument key of ${astNode.name}`);
    const namedChildValidation = astNodeErrors.namedChildren[key];
    if (namedChildValidation) {
      errors.push(...getAstNodeEvaluationErrors(namedChild, namedChildValidation));
    }
    errors.push(
      ...findArgumentErrorsFromParent(
        {
          type: 'namedChildren',
          key,
        },
        parentErrors,
      ),
    );
  }
  return errors;
}

export function findArgumentErrorsFromParent(
  pathSegment: PathSegment,
  parentErrors: EvaluationError[],
): EvaluationError[] {
  switch (pathSegment.type) {
    case 'children': {
      return parentErrors.filter((error) => error.argumentIndex == pathSegment.index);
    }
    case 'namedChildren':
      return parentErrors.filter((error) => error.argumentName == pathSegment.key);
  }
}

export function getIndirectEvaluationErrors({
  parentEvaluationErrors,
  pathSegment,
  isDivByZeroField,
  valueIsNull,
}: {
  parentEvaluationErrors?: EvaluationError[];
  pathSegment?: PathSegment;
  isDivByZeroField: boolean;
  valueIsNull: boolean;
}): EvaluationError[] {
  const out = [] as EvaluationError[];
  if (pathSegment && parentEvaluationErrors) {
    out.push(...findArgumentErrorsFromParent(pathSegment, parentEvaluationErrors));
  }
  if (isDivByZeroField) {
    out.push({
      error: 'DIVISION_BY_ZERO',
      message: 'Division by zero error',
    });
  }
  if (valueIsNull) {
    out.push({ error: 'NULL_FIELD_READ', message: 'Null value read' });
  }
  return out;
}

export function getValidationStatus({
  evaluationErrors,
  indirectEvaluationErrors,
}: {
  evaluationErrors: EvaluationError[];
  indirectEvaluationErrors: EvaluationError[];
}): ValidationStatus {
  if (evaluationErrors.length > 0) return 'error';
  if (indirectEvaluationErrors.length > 0) return 'light-error';

  return 'valid';
}

export type ValidationStatus = 'valid' | 'error' | 'light-error';

/**
 * Flatten the errors of the node and its children, stopping the recursion when the node is a "leaf"
 * @param viewModel
 * @returns the errors of the node and its children
 */
export function computeLineErrors(
  astNode: AstNode,
  astNodeErrors: AstNodeErrors,
): EvaluationError[] {
  const errors = getAstNodeEvaluationErrors(astNode, astNodeErrors);
  // Stop the recursion if the node is a leaf
  if (isLeafOperandAstNode(astNode)) {
    const { nodeErrors } = separateChildrenErrors(errors);
    return nodeErrors;
  }
  return [
    ...errors,
    ...astNode.children.flatMap((child, index) => {
      const childValidation = astNodeErrors.children[index];
      if (!childValidation) return [];
      return computeLineErrors(child, childValidation);
    }),
    ...Object.entries(astNode.namedChildren).flatMap(([key, namedChild]) => {
      const namedChildValidation = astNodeErrors.namedChildren[key];
      if (!namedChildValidation) return [];
      return computeLineErrors(namedChild, namedChildValidation);
    }),
  ];
}
