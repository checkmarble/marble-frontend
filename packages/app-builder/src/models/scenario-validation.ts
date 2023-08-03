import type { ConstantType } from './ast-node';

export interface NodeEvaluation {
  returnValue?: ConstantType;
  evaluationError: string;
  children: NodeEvaluation[];
  namedChildren: Record<string, NodeEvaluation>;
}

export interface ScenarioValidation {
  errors: string[];
  triggerEvaluation: NodeEvaluation;
  rulesEvaluations: NodeEvaluation[];
}
