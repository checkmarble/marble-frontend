import type { ScreeningConfigValidation } from '@app-builder/models';
import { NewNodeEvaluation } from '@app-builder/models/node-evaluation';
import type { ScenarioValidationErrorCodeDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import {
  collectScreeningValidationIssues,
  collectScreeningValidationMessages,
  hasScreeningErrors,
  type ScreeningValidationSectionLabels,
} from './scenario-validation';

const labels: ScreeningValidationSectionLabels = {
  trigger: 'Trigger conditions',
  counterparty: 'Counterparty ID',
  matchCriteria: 'Matching settings',
  queryField: (key) => key,
};

const getScenarioErrorMessage = (code: string) =>
  code === 'RULE_FORMULA_REQUIRED' ? 'At least one condition is required' : code;

function baseScreening(): ScreeningConfigValidation {
  return {
    trigger: { errors: [], triggerEvaluation: NewNodeEvaluation() },
    query: { errors: [], queryEvaluation: NewNodeEvaluation() },
    queryFields: {
      name: { errors: [], queryEvaluation: NewNodeEvaluation() },
    },
    counterpartyIdExpression: { errors: [], counterpartyIdEvaluation: NewNodeEvaluation() },
  };
}

function screeningWithAggregateRequired(): ScreeningConfigValidation {
  return {
    ...baseScreening(),
    query: { errors: ['RULE_FORMULA_REQUIRED'], queryEvaluation: NewNodeEvaluation() },
  };
}

describe('screening edit page validation options', () => {
  const editPageOptions = {
    ignoreLegacyAggregateQuery: true,
    entityType: 'Person' as const,
    formQuery: {
      name: { id: '1', name: 'FieldAccess', children: [] },
    },
  };

  it('does not surface legacy aggregate query under Matching settings', () => {
    const screening = screeningWithAggregateRequired();

    const messages = collectScreeningValidationMessages(screening, getScenarioErrorMessage, labels, editPageOptions);

    expect(messages.some((m) => m.startsWith('Matching settings:'))).toBe(false);
    expect(hasScreeningErrors(screening, editPageOptions)).toBe(false);
  });

  it('attaches query field source for per-field server errors', () => {
    const screening = {
      ...baseScreening(),
      queryFields: {
        name: {
          errors: ['RULE_FORMULA_REQUIRED' as ScenarioValidationErrorCodeDto],
          queryEvaluation: NewNodeEvaluation(),
        },
      },
    };

    const issues = collectScreeningValidationIssues(screening, getScenarioErrorMessage, labels, {
      ignoreLegacyAggregateQuery: true,
      entityType: 'Person',
      formQuery: {},
    });

    expect(issues).toEqual([
      {
        message: 'name: At least one condition is required',
        source: { type: 'field', field: 'query.name' },
      },
    ]);
  });

  it('suppresses stale per-field RULE_FORMULA_REQUIRED when form field is filled', () => {
    const screening = {
      ...baseScreening(),
      queryFields: {
        name: {
          errors: ['RULE_FORMULA_REQUIRED' as ScenarioValidationErrorCodeDto],
          queryEvaluation: NewNodeEvaluation(),
        },
      },
    };

    const messages = collectScreeningValidationMessages(screening, getScenarioErrorMessage, labels, editPageOptions);

    expect(messages).toEqual([]);
    expect(hasScreeningErrors(screening, editPageOptions)).toBe(false);
  });

  it('skips all query field errors when required criteria are met on another field', () => {
    const screening = {
      ...baseScreening(),
      queryFields: {
        name: {
          errors: ['RULE_FORMULA_REQUIRED' as ScenarioValidationErrorCodeDto],
          queryEvaluation: NewNodeEvaluation(),
        },
        birthDate: {
          errors: ['RULE_FORMULA_REQUIRED' as ScenarioValidationErrorCodeDto],
          queryEvaluation: NewNodeEvaluation(),
        },
      },
    };

    const messages = collectScreeningValidationMessages(screening, getScenarioErrorMessage, labels, editPageOptions);

    expect(messages).toEqual([]);
    expect(hasScreeningErrors(screening, editPageOptions)).toBe(false);
  });
});

describe('rules list validation (no edit page options)', () => {
  it('still reports aggregate query errors without edit page options', () => {
    const screening = screeningWithAggregateRequired();

    expect(hasScreeningErrors(screening)).toBe(true);
  });
});
