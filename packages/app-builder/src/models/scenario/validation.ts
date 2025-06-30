import { type ScenarioValidationDto, type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as R from 'remeda';

import { adaptNodeEvaluation, type NodeEvaluation } from '../node-evaluation';

export interface ScenarioIterationRuleValidation {
  errors: ScenarioValidationErrorCodeDto[];
  ruleEvaluation: NodeEvaluation;
}

export interface ScenarioValidation {
  trigger: {
    errors: ScenarioValidationErrorCodeDto[];
    triggerEvaluation: NodeEvaluation;
  };
  rules: {
    errors: ScenarioValidationErrorCodeDto[];
    ruleItems: {
      [key: string]: ScenarioIterationRuleValidation;
    };
  };
  decision: {
    errors: ScenarioValidationErrorCodeDto[];
  };
}

export function adaptScenarioValidation(dto: ScenarioValidationDto): ScenarioValidation {
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
