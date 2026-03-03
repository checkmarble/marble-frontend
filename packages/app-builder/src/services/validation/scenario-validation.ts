import { type ScenarioValidation } from '@app-builder/models';
import { type EvaluationError, NewNodeEvaluation, type NodeEvaluation } from '@app-builder/models/node-evaluation';
import invariant from 'tiny-invariant';

// return just an array of error from a recursive evaluation
function flattenNodeEvaluationErrors(evaluation: NodeEvaluation): EvaluationError[] {
  return [
    ...(evaluation.errors ?? []),
    ...evaluation.children.flatMap(flattenNodeEvaluationErrors),
    ...Object.values(evaluation.namedChildren).flatMap(flattenNodeEvaluationErrors),
  ];
}

export function findRuleValidation(validation: ScenarioValidation, ruleId: string) {
  const ruleValidation = validation.rules.ruleItems[ruleId];

  invariant(ruleValidation !== undefined, `Rule ${ruleId} not found in validation`);

  return ruleValidation;
}

export function countNodeEvaluationErrors(evaluation: NodeEvaluation): number {
  return flattenNodeEvaluationErrors(evaluation).length;
}

export function hasTriggerErrors(validation: ScenarioValidation): boolean {
  if (validation.trigger.errors.length > 0) return true;

  if (countNodeEvaluationErrors(validation.trigger.triggerEvaluation) > 0) return true;

  return false;
}

export function hasRulesErrors(validation: ScenarioValidation): boolean {
  if (validation.rules.errors.length > 0) return true;

  for (const rule of Object.values(validation.rules.ruleItems)) {
    if (hasRuleErrors(rule)) return true;
  }

  return false;
}

export function hasDecisionErrors(validation: ScenarioValidation): boolean {
  if (validation.decision.errors.length > 0) return true;

  return false;
}

export function hasRuleErrors(ruleValidation: ScenarioValidation['rules']['ruleItems'][number]): boolean {
  return ruleValidation.errors.length > 0 || countNodeEvaluationErrors(ruleValidation.ruleEvaluation) > 0;
}

export function findScreeningValidation(validation: ScenarioValidation, screeningId: string) {
  // Try to find by ID first (if indexed by ID)
  let screeningValidation = validation.screeningConfigs[screeningId];

  // If not found, return empty validation
  if (screeningValidation === undefined) {
    const emptyEvaluation = NewNodeEvaluation();
    return {
      trigger: { errors: [], triggerEvaluation: emptyEvaluation },
      query: { errors: [], queryEvaluation: emptyEvaluation },
      queryFields: {},
      counterpartyIdExpression: { errors: [], counterpartyIdEvaluation: emptyEvaluation },
    };
  }

  return screeningValidation;
}

export function hasScreeningErrors(screening: ScenarioValidation['screeningConfigs'][string]): boolean {
  // Check trigger errors
  if (screening.trigger.errors.length > 0) return true;
  if (countNodeEvaluationErrors(screening.trigger.triggerEvaluation) > 0) return true;

  // Check query errors
  if (screening.query.errors.length > 0) return true;
  if (countNodeEvaluationErrors(screening.query.queryEvaluation) > 0) return true;

  // Check query fields errors
  for (const field of Object.values(screening.queryFields)) {
    if (field.errors.length > 0) return true;
    if (countNodeEvaluationErrors(field.queryEvaluation) > 0) return true;
  }

  // Check counterparty ID expression errors
  if (screening.counterpartyIdExpression.errors.length > 0) return true;
  if (countNodeEvaluationErrors(screening.counterpartyIdExpression.counterpartyIdEvaluation) > 0) return true;

  return false;
}

export function hasScreeningsErrors(validation: ScenarioValidation): boolean {
  for (const screening of Object.values(validation.screeningConfigs)) {
    if (hasScreeningErrors(screening)) return true;
  }

  return false;
}
