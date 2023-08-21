import type { ConstantType } from './ast-node';

export type EvaluationErrorCode =
  | 'UNEXPECTED_ERROR'
  | 'UNKNOWN_FUNCTION'
  | 'WRONG_NUMBER_OF_ARGUMENTS';

export interface EvaluationError {
  code: EvaluationErrorCode;
  message: string;
}

export interface NodeEvaluation {
  returnValue?: ConstantType;
  errors: EvaluationError[] | null;
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
}

export interface ScenarioValidation {
  errors: string[];
  triggerEvaluation: NodeEvaluation;
  rulesEvaluations: Record<string, NodeEvaluation>;
}
