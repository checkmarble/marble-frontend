import {
  type EvaluationErrorDto,
  type NodeEvaluationDto,
  type ScenarioValidationDto,
} from '@marble-api';
import * as R from 'remeda';

import type { ConstantType } from './ast-node';

export type EvaluationErrorCode =
  | 'UNEXPECTED_ERROR'
  | 'UNKNOWN_FUNCTION'
  | 'WRONG_NUMBER_OF_ARGUMENTS';

export interface EvaluationError {
  code: EvaluationErrorCode;
  message: string;
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
    code: dto.code,
    message: dto.message,
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
  const childrenPathErrors = evaluation.children
    .map((child, index) => {
      return adaptNodeEvaluationErrors(`${path}.children.${index}`, child);
    })
    .flat();

  return [{ path, ...evaluation }, ...childrenPathErrors];
}
