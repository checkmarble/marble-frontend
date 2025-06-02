import type { EvaluationErrorCodeDto, EvaluationErrorDto, NodeEvaluationDto } from 'marble-api';
import * as R from 'remeda';

import type { ConstantType } from './astNode/ast-node';

export type ReturnValue =
  | {
      value: ConstantType;
      isOmitted: false;
    }
  | {
      isOmitted: true;
    };

export type ReturnValueType = 'string' | 'int' | 'float' | 'bool';

export type NonOmittedReturnValue = { value: ConstantType; isOmitted: false };

export function hasReturnValue(returnValue: ReturnValue): returnValue is NonOmittedReturnValue {
  return !returnValue.isOmitted;
}

export type EvaluationErrorCode = EvaluationErrorCodeDto | 'FUNCTION_ERROR';

export interface EvaluationError {
  error: EvaluationErrorCode;
  message: string;
  path?: string;
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
  returnValue: ReturnValue;
  errors: EvaluationError[];
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
  skipped?: boolean;
}

export function NewNodeEvaluation(): NodeEvaluation {
  return {
    returnValue: { isOmitted: true },
    errors: [],
    children: [],
    namedChildren: {},
    skipped: false,
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
    namedChildren: dto.named_children ? R.mapValues(dto.named_children, adaptNodeEvaluation) : {},
    skipped: dto.skipped,
  };
}
