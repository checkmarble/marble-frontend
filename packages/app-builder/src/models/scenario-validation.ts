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
  | 'ARGUMENT_MUST_BE_TIME'
  | 'ARGUMENT_REQUIRED';

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
  returnValue: ConstantType;
  errors: EvaluationError[] | null;
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
}

interface ValidationSuccess {
  state: 'valid';
}

interface PendingValidation {
  state: 'pending';
}

interface ValidationFailure {
  state: 'fail';
  errors: EvaluationError[];
}

export type Validation =
  | ValidationSuccess
  | PendingValidation
  | ValidationFailure;

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
  return {
    returnValue: dto.return_value,
    errors: dto.errors ? dto.errors.map(adaptEvaluationError) : null,
    children: dto.children ? dto.children.map(adaptNodeEvaluation) : [],
    namedChildren: dto.named_children
      ? R.mapValues(dto.named_children, adaptNodeEvaluation)
      : {},
  };
}

export function adaptValidation(evaluation: NodeEvaluation): Validation {
  if (evaluation.errors === null) {
    return { state: 'pending' };
  } else if (evaluation.errors.length === 0) {
    return { state: 'valid' };
  } else {
    return {
      state: 'fail',
      errors: evaluation.errors,
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

type ValidationErrors = Validation & { path: string };

export function adaptValidationErrors(
  path: string,
  evaluation: NodeEvaluation
): ValidationErrors[] {
  const childrenPathErrors = R.pipe(
    evaluation.children,
    R.map.indexed((child, index) => {
      return adaptValidationErrors(`${path}.children.${index}`, child);
    }),
    R.flatten()
  );

  const namedChildrenPathErrors = R.pipe(
    R.toPairs(evaluation.namedChildren),
    R.flatMap(([key, child]) => {
      return adaptValidationErrors(`${path}.namedChildren.${key}`, child);
    })
  );

  return [
    { ...adaptValidation(evaluation), path },
    ...childrenPathErrors,
    ...namedChildrenPathErrors,
  ];
}
