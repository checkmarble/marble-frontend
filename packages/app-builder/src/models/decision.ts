import {
  type Case,
  type DecisionDetailDto,
  type DecisionDto,
  type DecisionWithoutRuleDto,
  type Error,
  type Outcome,
  type RuleExecutionDto,
} from 'marble-api';

import { adaptAstNode, type AstNode } from './ast-node';

interface DecisionWithoutRule {
  id: string;
  createdAt: string;
  triggerObject: Record<string, unknown>;
  triggerObjectType: string;
  outcome: Outcome;
  scenario: {
    id: string;
    name: string;
    description: string;
    version: number;
  };
  score: number;
  error?: Error;
}

export interface RuleExecution {
  name: string;
  description?: string;
  scoreModifier: number;
  status?: 'triggered' | 'error';
  error?: Error;
}

export interface Decision extends DecisionWithoutRule {
  rules: RuleExecution[];
}

export interface RuleExecutionWithFormula extends RuleExecution {
  formula?: AstNode | null;
}

export interface DecisionDetail extends DecisionWithoutRule {
  case?: Case;
  rules: RuleExecutionWithFormula[];
}

function adaptDecisionWithoutRule(
  dto: DecisionWithoutRuleDto,
): DecisionWithoutRule {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    triggerObject: dto.trigger_object,
    triggerObjectType: dto.trigger_object_type,
    outcome: dto.outcome,
    scenario: {
      id: dto.scenario.id,
      name: dto.scenario.name,
      description: dto.scenario.description,
      version: dto.scenario.version,
    },
    score: dto.score,
  };
}

function adaptRuleExecutionDto(dto: RuleExecutionDto): RuleExecution {
  const status = dto.result ? 'triggered' : dto.error ? 'error' : undefined;

  return {
    name: dto.name,
    description: dto.description || undefined,
    scoreModifier: dto.score_modifier,
    status,
    error: dto.error,
  };
}

export function adaptDecision(dto: DecisionDto): Decision {
  return {
    ...adaptDecisionWithoutRule(dto),
    rules: dto.rules.map(adaptRuleExecutionDto),
  };
}

export function adaptDecisionDetail(dto: DecisionDetailDto): DecisionDetail {
  return {
    ...adaptDecisionWithoutRule(dto),
    case: dto.case,
    rules: dto.rules.map((rule) => ({
      ...adaptRuleExecutionDto(rule),
      formula: rule.formula_ast_expression
        ? adaptAstNode(rule.formula_ast_expression)
        : null,
    })),
  };
}
