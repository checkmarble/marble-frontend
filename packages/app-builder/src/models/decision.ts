import {
  type Case,
  type DecisionDetailDto,
  type DecisionDto,
  type Error,
  type Outcome,
  type RuleExecutionDto,
} from 'marble-api';

export interface Decision {
  id: string;
  createdAt: string;
  triggerObject: Record<string, unknown>;
  triggerObjectType: string;
  outcome: Outcome;
  scenario: {
    id: string;
    name: string;
    description: string;
    scenarioIterationId: string;
    version: number;
  };
  score: number;
  error?: Error;
  case?: Case;
}

export interface RuleExecution {
  name: string;
  description?: string;
  scoreModifier: number;
  status?: 'triggered' | 'error';
  error?: Error;
  ruleId: string;
}

export interface DecisionDetail extends Decision {
  rules: RuleExecution[];
}

export function adaptDecision(dto: DecisionDto): Decision {
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
      scenarioIterationId: dto.scenario.scenario_iteration_id,
      version: dto.scenario.version,
    },
    score: dto.score,
    case: dto.case,
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
    ruleId: dto.rule_id,
  };
}

export function adaptDecisionDetail(dto: DecisionDetailDto): DecisionDetail {
  return {
    ...adaptDecision(dto),
    rules: dto.rules.map(adaptRuleExecutionDto),
  };
}
