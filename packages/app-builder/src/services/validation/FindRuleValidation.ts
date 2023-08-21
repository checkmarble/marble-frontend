import type { NodeEvaluation, ScenarioValidation } from '@app-builder/models';

export function findRuleValidation(
  validation: ScenarioValidation,
  ruleId: string
): NodeEvaluation {
  const evaluation = validation.rulesEvaluations[ruleId];
  if (evaluation === undefined) {
    throw Error(`Rule ${ruleId} not found in validation`);
  }
  return evaluation;
}
