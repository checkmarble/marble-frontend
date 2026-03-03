import { type ScenarioValidationDto, type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as R from 'remeda';

import { adaptNodeEvaluation, type NodeEvaluation } from '../node-evaluation';

export interface ScenarioIterationRuleValidation {
  errors: ScenarioValidationErrorCodeDto[];
  ruleEvaluation: NodeEvaluation;
}

export interface ScreeningConfigValidation {
  trigger: {
    errors: ScenarioValidationErrorCodeDto[];
    triggerEvaluation: NodeEvaluation;
  };
  query: {
    errors: ScenarioValidationErrorCodeDto[];
    queryEvaluation: NodeEvaluation;
  };
  queryFields: {
    [key: string]: {
      errors: ScenarioValidationErrorCodeDto[];
      queryEvaluation: NodeEvaluation;
    };
  };
  counterpartyIdExpression: {
    errors: ScenarioValidationErrorCodeDto[];
    counterpartyIdEvaluation: NodeEvaluation;
  };
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
  screeningConfigs: {
    [key: string]: ScreeningConfigValidation;
  };
  decision: {
    errors: ScenarioValidationErrorCodeDto[];
  };
}

export function adaptScenarioValidation(dto: ScenarioValidationDto): ScenarioValidation {
  const screeningConfigsList = dto.screening_configs ?? [];

  // Note: Screening configs validation is indexed by array position, not by screening ID
  // The backend returns validation as an array without IDs, so we use array indices as keys
  // This ensures consistency in the validation lookup

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
    screeningConfigs: R.mapValues(
      R.fromEntries(screeningConfigsList.map((config, index) => [index.toString(), config])),
      (config) => ({
        trigger: {
          errors: config.trigger.errors.map(({ error }) => error),
          triggerEvaluation: adaptNodeEvaluation(config.trigger.trigger_evaluation),
        },
        query: {
          errors: config.query.errors.map(({ error }) => error),
          queryEvaluation: adaptNodeEvaluation(config.query.rule_evaluation),
        },
        queryFields: R.mapValues(config.query_fields, (field) => ({
          errors: field.errors.map(({ error }) => error),
          queryEvaluation: adaptNodeEvaluation(field.rule_evaluation),
        })),
        counterpartyIdExpression: {
          errors: config.counterparty_id_expression.errors.map(({ error }) => error),
          counterpartyIdEvaluation: adaptNodeEvaluation(config.counterparty_id_expression.rule_evaluation),
        },
      }),
    ),
    decision: {
      errors: dto.decision.errors.map(({ error }) => error),
    },
  };
}
