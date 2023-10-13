import {
  type EditorNodeViewModel,
  findArgumentNameErrorsFromParent,
} from '@app-builder/services/editor/ast-editor';
import {
  type EvaluationErrorDto,
  type NodeEvaluationDto,
  type ScenarioValidationDto,
  type ScenarioValidationErrorCodeDto,
} from '@marble-api';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

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
  | 'ARGUMENT_REQUIRED'
  | 'AGGREGATION_ERROR';

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

export interface ScenarioValidation {
  trigger: {
    errors: ScenarioValidationErrorCodeDto[];
    triggerEvaluation: NodeEvaluation;
  };
  rules: {
    errors: ScenarioValidationErrorCodeDto[];
    ruleItems: {
      [key: string]: {
        errors: ScenarioValidationErrorCodeDto[];
        ruleEvaluation: NodeEvaluation;
      };
    };
  };
  decision: {
    errors: ScenarioValidationErrorCodeDto[];
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

export function adaptScenarioValidation(
  dto: ScenarioValidationDto
): ScenarioValidation {
  return {
    trigger: {
      errors: dto.trigger.errors.map(({ error }) => error),
      triggerEvaluation: adaptNodeEvaluation(dto.trigger.trigger_evaluation),
    },
    rules: {
      errors: dto.rules.errors.map(({ error }) => error),
      ruleItems: R.mapValues(dto.rules.rules, (rule) => ({
        errors: rule.errors.map(({ error }) => error),
        ruleEvaluation: adaptNodeEvaluation(rule.rule_evaluation),
      })),
    },
    decision: {
      errors: dto.decision.errors.map(({ error }) => error),
    },
  };
}

export const computeValidationForNamedChildren = (
  editorNodeViewModel: EditorNodeViewModel,
  namedArgumentKey: string | string[]
): { errors: EvaluationError[] } => {
  let namedArgumentKeys = namedArgumentKey;
  if (typeof namedArgumentKey === 'string') {
    namedArgumentKeys = [namedArgumentKey];
  }
  const errors: EvaluationError[] = [];
  for (const key of namedArgumentKeys) {
    invariant(
      key in editorNodeViewModel.namedChildren,
      `${key} is not a valid named argument key`
    );
    const namedChild = editorNodeViewModel.namedChildren[key];

    errors.push(...namedChild.validation.errors);
    errors.push(...findArgumentNameErrorsFromParent(namedChild));
  }
  return { errors };
};

export const separateChildrenErrors = (validation: {
  errors: EvaluationError[];
}): [EvaluationError[], EvaluationError[]] => {
  return R.partition(validation.errors, (error) => {
    return error.argumentIndex != undefined;
  });
};
