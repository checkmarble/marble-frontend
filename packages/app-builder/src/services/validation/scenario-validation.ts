import {
  type EvaluationError,
  type NodeEvaluation,
  type ScenarioValidation,
} from '@app-builder/models';
import invariant from 'tiny-invariant';

// return just an array of error from a recursive evaluation
function flattenNodeEvaluationErrors(
  evaluation: NodeEvaluation,
): EvaluationError[] {
  return [
    ...(evaluation.errors ?? []),
    ...evaluation.children.flatMap(flattenNodeEvaluationErrors),
    ...Object.values(evaluation.namedChildren).flatMap(
      flattenNodeEvaluationErrors,
    ),
  ];
}

export function findRuleValidation(
  validation: ScenarioValidation,
  ruleId: string,
) {
  const ruleValidation = validation.rules.ruleItems[ruleId];

  invariant(
    ruleValidation !== undefined,
    `Rule ${ruleId} not found in validation`,
  );

  return ruleValidation;
}

export function countNodeEvaluationErrors(evaluation: NodeEvaluation): number {
  return flattenNodeEvaluationErrors(evaluation).length;
}

export function hasTriggerErrors(validation: ScenarioValidation): boolean {
  if (validation.trigger.errors.length > 0) return true;

  if (countNodeEvaluationErrors(validation.trigger.triggerEvaluation) > 0)
    return true;

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

export function hasRuleErrors(
  ruleValidation: ScenarioValidation['rules']['ruleItems'][number],
): boolean {
  return (
    ruleValidation.errors.length > 1 ||
    countNodeEvaluationErrors(ruleValidation.ruleEvaluation) > 0
  );
}
