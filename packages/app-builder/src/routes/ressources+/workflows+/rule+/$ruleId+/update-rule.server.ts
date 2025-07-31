import { Rule, WorkflowAction, WorkflowCondition } from '@app-builder/models/scenario/workflow';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import * as R from 'remeda';
import { z } from 'zod';

export type ConditionsMap = Map<string, WorkflowCondition>;
export type ActionsMap = Map<string, WorkflowAction>;

// Zod schema for validating PUT request body
const astNodeSchema: z.ZodTypeAny = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  constant: z.any().optional(),
  children: z.array(z.lazy(() => astNodeSchema)).optional(),
  named_children: z.record(z.lazy(() => astNodeSchema)).optional(),
});

const workflowConditionSchema = z
  .object({
    id: z.string(),
  })
  .and(
    z.discriminatedUnion('function', [
      z.object({
        function: z.literal('always'),
      }),
      z.object({
        function: z.literal('never'),
      }),
      z.object({
        function: z.literal('outcome_in'),
        params: z.array(z.enum(['approve', 'review', 'decline', 'block_and_review', 'unknown'])),
      }),
      z.object({
        function: z.literal('rule_hit'),
        params: z.object({
          rule_id: z.string(),
        }),
      }),
      z.object({
        function: z.literal('payload_evaluates'),
        params: z.object({
          expression: astNodeSchema,
        }),
      }),
    ]),
  );

const workflowActionSchema = z
  .object({
    id: z.string(),
  })
  .and(
    z.discriminatedUnion('action', [
      z.object({
        action: z.literal('DISABLED'),
      }),
      z.object({
        action: z.enum(['CREATE_CASE', 'ADD_TO_CASE_IF_POSSIBLE']),
        params: z.object({
          inboxId: z.string(),
          anyInbox: z.boolean().optional(),
          titleTemplate: astNodeSchema.optional(),
        }),
      }),
    ]),
  );

export const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Rule name is required'),
  fallthrough: z.boolean(),
  conditions: z.array(workflowConditionSchema),
  actions: z.array(workflowActionSchema).length(1, 'Exactly one action is required'),
});
export function validateUpdateWorkflowRuleRequest(data: unknown): Rule {
  return ruleSchema.parse(data) as Rule;
}

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

export async function updateWorkflowRule(scenario: ScenarioRepository, rule: Rule): Promise<void> {
  console.log('requestData', JSON.stringify(rule, null, 2));
  const modifiedRule = validateUpdateWorkflowRuleRequest(rule);

  // First get the rule from the API
  const originalRule = await scenario.getWorkflowRule({ ruleId: rule.id });
  console.log('originalRule', JSON.stringify(originalRule, null, 2));

  console.log('request.json', JSON.stringify(modifiedRule, null, 2));

  // Handle conditions
  const originalConditions: ConditionsMap = new Map(
    originalRule.conditions.map((condition) => [condition.id, condition]),
  );
  const modifiedConditions: ConditionsMap = new Map(
    modifiedRule.conditions.map((condition) => [condition.id, condition]),
  );

  console.log('getNewItems', getNewItems(originalConditions, modifiedConditions));
  console.log('getMissingItems', getMissingItems(originalConditions, modifiedConditions));
  console.log('getModifiedItems', getModifiedItems(originalConditions, modifiedConditions));

  // Delete missing conditions
  getMissingItems(originalConditions, modifiedConditions).forEach((condition) => {
    scenario.deleteWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id,
    });
  });

  // Create new conditions
  getNewItems(originalConditions, modifiedConditions).forEach((condition) => {
    scenario.createWorkflowCondition({
      ruleId: rule.id,
      condition,
    });
  });

  // Update modified conditions
  getModifiedItems(originalConditions, modifiedConditions).forEach((condition) => {
    scenario.updateWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id,
      condition,
    });
  });

  // Update action
  // We currently support only one action per rule
  // A rule always has an action
  const originalAction = originalRule.actions[0];
  const modifiedAction = modifiedRule.actions[0];

  if (!originalAction) {
    scenario.createWorkflowAction({
      ruleId: rule.id,
      action: modifiedAction!,
    });
  }

  if (originalAction && modifiedAction && !R.isDeepEqual(originalAction, modifiedAction)) {
    scenario.updateWorkflowAction({
      ruleId: rule.id,
      actionId: originalAction.id!,
      action: modifiedAction,
    });
  }
}
