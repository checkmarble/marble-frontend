import {
  type EvaluationErrorDto,
  type NodeEvaluationDto,
  type ScenarioValidationDto,
} from '@marble-api';
import * as R from 'remeda';

import type { ConstantType } from './ast-node';

export type EvaluationErrorCode =
  | 'UNEXPECTED_ERROR'
  | 'UNDEFINED_FUNCTION'
  | 'WRONG_NUMBER_OF_ARGUMENTS'
  | 'MISSING_NAMED_ARGUMENT'
  | 'ARGUMENTS_MUST_BE_INT_OR_FLOAT'
  | 'ARGUMENT_MUST_BE_INTEGER'
  | 'ARGUMENT_MUST_BE_STRING'
  | 'ARGUMENT_MUST_BE_BOOLEAN'
  | 'ARGUMENT_MUST_BE_LIST'
  | 'ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION'
  | 'ARGUMENT_MUST_BE_TIME';

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

interface CommonNodeEvaluation {
  returnValue?: ConstantType;
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
}

interface ValidNodeEvaluation extends CommonNodeEvaluation {
  state: 'valid';
}

interface PendingNodeEvaluation extends CommonNodeEvaluation {
  state: 'pending';
}

interface InvalidNodeEvaluation extends CommonNodeEvaluation {
  state: 'invalid';
  errors: EvaluationError[];
}

export type NodeEvaluation =
  | ValidNodeEvaluation
  | PendingNodeEvaluation
  | InvalidNodeEvaluation;

export interface ScenarioValidation {
  errors: string[];
  triggerEvaluation: NodeEvaluation;
  rulesEvaluations: Record<string, NodeEvaluation>;
}

function adaptEvaluationError(dto: EvaluationErrorDto): EvaluationError {
  return {
    error: dto.error,
    message: dto.message,
    argumentIndex: dto.argument_index,
    argumentName: dto.argument_name,
  };
}

function adaptNodeEvaluation(dto: NodeEvaluationDto): NodeEvaluation {
  const commonNodeEvaluation = {
    returnValue: dto.return_value,
    children: dto.children ? dto.children.map(adaptNodeEvaluation) : [],
    namedChildren: dto.named_children
      ? R.mapValues(dto.named_children, adaptNodeEvaluation)
      : {},
  };
  if (dto.errors === null) {
    return { ...commonNodeEvaluation, state: 'pending' };
  } else if (dto.errors.length === 0) {
    return { ...commonNodeEvaluation, state: 'valid' };
  } else {
    return {
      ...commonNodeEvaluation,
      state: 'invalid',
      errors: dto.errors.map(adaptEvaluationError),
    };
  }
}

export function adaptScenarioValidation(
  dto: ScenarioValidationDto
): ScenarioValidation {
  return {
    errors: dto.errors,
    triggerEvaluation: adaptNodeEvaluation(dto.trigger_evaluation),
    rulesEvaluations: R.mapValues(dto.rules_evaluations, adaptNodeEvaluation),
  };
}

type NodeEvaluationErrors = NodeEvaluation & { path: string };

export function adaptNodeEvaluationErrors(
  path: string,
  evaluation: NodeEvaluation
): NodeEvaluationErrors[] {
  const childrenPathErrors = R.pipe(
    evaluation.children,
    R.map.indexed((child, index) => {
      return adaptNodeEvaluationErrors(`${path}.children.${index}`, child);
    }),
    R.flatten()
  );

  const namedChildrenPathErrors = R.pipe(
    R.toPairs(evaluation.namedChildren),
    R.flatMap(([key, child]) => {
      return adaptNodeEvaluationErrors(`${path}.namedChildren.${key}`, child);
    })
  );

  return [
    { path, ...evaluation },
    ...childrenPathErrors,
    ...namedChildrenPathErrors,
  ];
}
