import {
  type EditorNodeViewModel,
  findArgumentNameErrorsFromParent,
} from '@app-builder/services/editor/ast-editor';
import {
  type EvaluationErrorCodeDto,
  type EvaluationErrorDto,
  type NodeEvaluationDto,
} from 'marble-api';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

import type { ConstantType } from './ast-node';

export type EvaluationErrorCode = EvaluationErrorCodeDto | 'FUNCTION_ERROR';

export interface EvaluationError {
  error: EvaluationErrorCode;
  message: string;
  argumentIndex?: number;
  argumentName?: string;
}

export function isUndefinedFunctionError(evaluationError: {
  error: string;
  message: string;
}): evaluationError is { error: 'UNDEFINED_FUNCTION'; message: string } {
  return evaluationError.error === 'UNDEFINED_FUNCTION';
}

export interface NodeEvaluation {
  returnValue:
    | {
        value: ConstantType;
        isOmitted: false;
      }
    | {
        isOmitted: true;
      };
  errors: EvaluationError[];
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
}

export function NewNodeEvaluation(): NodeEvaluation {
  return {
    returnValue: { isOmitted: true },
    errors: [],
    children: [],
    namedChildren: {},
  };
}

function adaptEvaluationError(dto: EvaluationErrorDto): EvaluationError {
  return {
    error: dto.error,
    message: dto.message,
    argumentIndex: dto.argument_index,
    argumentName: dto.argument_name,
  };
}

export function adaptNodeEvaluation(dto: NodeEvaluationDto): NodeEvaluation {
  const returnValue = dto.return_value.is_omitted
    ? { isOmitted: true as const }
    : { isOmitted: false as const, value: dto.return_value.value ?? null };

  return {
    returnValue,
    errors: dto.errors ? dto.errors.map(adaptEvaluationError) : [],
    children: dto.children ? dto.children.map(adaptNodeEvaluation) : [],
    namedChildren: dto.named_children
      ? R.mapValues(dto.named_children, adaptNodeEvaluation)
      : {},
  };
}

export const computeValidationForNamedChildren = (
  editorNodeViewModel: EditorNodeViewModel,
  namedArgumentKey: string | string[],
): EvaluationError[] => {
  let namedArgumentKeys = namedArgumentKey;
  if (typeof namedArgumentKey === 'string') {
    namedArgumentKeys = [namedArgumentKey];
  }
  const errors: EvaluationError[] = [];
  for (const key of namedArgumentKeys) {
    const namedChild = editorNodeViewModel.namedChildren[key];
    invariant(namedChild, `${key} is not a valid named argument key`);

    errors.push(...namedChild.errors);
    errors.push(...findArgumentNameErrorsFromParent(namedChild));
  }
  return errors;
};

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
