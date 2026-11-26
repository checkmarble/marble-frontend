import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type Rule, type WorkflowCondition } from '@app-builder/models/scenario/workflow';
import {
  createWorkflowAction,
  createWorkflowCondition,
  getWorkflowRule,
  updateWorkflowAction,
  updateWorkflowCondition,
  updateWorkflowRule,
} from '@app-builder/server/scenarios';
import * as R from 'remeda';

type ConditionsMap = Map<string, WorkflowCondition>;

const getNewItems = <T extends { id: string }>(
  originalItems: Map<string, T>,
  modifiedItems: Map<string, T>,
): Map<string, T> => new Map([...modifiedItems].filter(([id]) => !originalItems.has(id)));

const getMissingItems = <T extends { id: string }>(
  originalItems: Map<string, T>,
  modifiedItems: Map<string, T>,
): Map<string, T> => new Map([...originalItems].filter(([id]) => !modifiedItems.has(id)));

const getModifiedItems = <T extends { id: string }>(
  originalItems: Map<string, T>,
  modifiedItems: Map<string, T>,
): Map<string, T> =>
  new Map(
    [...modifiedItems]
      .filter(([id]) => originalItems.has(id))
      .filter(([id, value]) => !R.isDeepEqual(value, originalItems.get(id))),
  );

export async function syncWorkflowRule(api: MarbleCoreApi, rule: Rule): Promise<void> {
  const modifiedRule = rule;

  // First get the rule from the API
  const originalRule = await getWorkflowRule(api, { ruleId: rule.id });

  const originalConditions: ConditionsMap = new Map(
    originalRule.conditions.map((condition) => [condition.id, condition]),
  );
  const modifiedConditions: ConditionsMap = new Map(
    modifiedRule.conditions.map((condition) => [condition.id, condition]),
  );

  // Delete missing conditions
  const deleteMissingConditionsPromises = Array.from(
    getMissingItems(originalConditions, modifiedConditions).values(),
  ).map((condition) => api.deleteWorkflowCondition(rule.id, condition.id));
  await Promise.all(deleteMissingConditionsPromises);

  const createNewConditionsPromises = Array.from(getNewItems(originalConditions, modifiedConditions).values()).map(
    (condition) =>
      createWorkflowCondition(api, {
        ruleId: rule.id,
        condition,
      }),
  );
  await Promise.all(createNewConditionsPromises);

  const updateModifiedConditionsPromises = Array.from(
    getModifiedItems(originalConditions, modifiedConditions).values(),
  ).map((condition) =>
    updateWorkflowCondition(api, {
      ruleId: rule.id,
      conditionId: condition.id,
      condition,
    }),
  );
  await Promise.all(updateModifiedConditionsPromises);

  // We currently support only one action per rule
  // A rule always has an action
  const originalAction = originalRule.actions[0];
  const modifiedAction = modifiedRule.actions[0];

  if (!originalAction && modifiedAction) {
    await createWorkflowAction(api, {
      ruleId: rule.id,
      action: modifiedAction,
    });
  }

  if (originalAction && modifiedAction && !R.isDeepEqual(originalAction, modifiedAction)) {
    await updateWorkflowAction(api, {
      ruleId: rule.id,
      actionId: originalAction.id!,
      action: modifiedAction,
    });
  }

  if (originalRule.name !== modifiedRule.name || originalRule.fallthrough !== modifiedRule.fallthrough) {
    await updateWorkflowRule(api, {
      ruleId: rule.id,
      name: modifiedRule.name,
      fallthrough: modifiedRule.fallthrough,
    });
  }
}
