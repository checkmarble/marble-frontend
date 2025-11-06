import { Rule, WorkflowAction, WorkflowCondition } from '@app-builder/models/scenario/workflow';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import * as R from 'remeda';
import { z } from 'zod/v4';

export type ConditionsMap = Map<string, WorkflowCondition>;
export type ActionsMap = Map<string, WorkflowAction>;

const astNodeSchema: z.ZodTypeAny = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  constant: z.any().optional(),
  children: z.array(z.lazy(() => astNodeSchema)).optional(),
  namedChildren: z
    .record(
      z.string(),
      z.lazy(() => astNodeSchema),
    )
    .optional(),
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
          ruleIds: z.array(z.string()),
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
  const modifiedRule = validateUpdateWorkflowRuleRequest(rule);

  // First get the rule from the API
  const originalRule = await scenario.getWorkflowRule({ ruleId: rule.id });

  // Handle conditions
  const originalConditions: ConditionsMap = new Map(
    originalRule.conditions.map((condition) => [condition.id, condition]),
  );
  const modifiedConditions: ConditionsMap = new Map(
    modifiedRule.conditions.map((condition) => [condition.id, condition]),
  );

  // Delete missing conditions
  const deleteMissingConditionsPromises = Array.from(
    getMissingItems(originalConditions, modifiedConditions).values(),
  ).map((condition) =>
    scenario.deleteWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id,
    }),
  );
  await Promise.all(deleteMissingConditionsPromises);

  // Create new conditions
  const createNewConditionsPromises = Array.from(getNewItems(originalConditions, modifiedConditions).values()).map(
    (condition) =>
      scenario.createWorkflowCondition({
        ruleId: rule.id,
        condition,
      }),
  );
  await Promise.all(createNewConditionsPromises);

  // Update modified conditions
  const updateModifiedConditionsPromises = Array.from(
    getModifiedItems(originalConditions, modifiedConditions).values(),
  ).map((condition) =>
    scenario.updateWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id,
      condition,
    }),
  );
  await Promise.all(updateModifiedConditionsPromises);

  // Update action
  // We currently support only one action per rule
  // A rule always has an action
  const originalAction = originalRule.actions[0];
  const modifiedAction = modifiedRule.actions[0];

  if (!originalAction && modifiedAction) {
    await scenario.createWorkflowAction({
      ruleId: rule.id,
      action: modifiedAction,
    });
  }

  if (originalAction && modifiedAction && !R.isDeepEqual(originalAction, modifiedAction)) {
    await scenario.updateWorkflowAction({
      ruleId: rule.id,
      actionId: originalAction.id!,
      action: modifiedAction,
    });
  }

  // Update rule name

  // Update rule name
  if (originalRule.name !== modifiedRule.name || originalRule.fallthrough !== modifiedRule.fallthrough) {
    await scenario.updateWorkflowRule({
      ruleId: rule.id,
      name: modifiedRule.name,
      fallthrough: modifiedRule.fallthrough,
    });
  }

  // Update rule fallthrough
  // For future use
  // if (originalRule.fallthrough !== modifiedRule.fallthrough) {
  //   scenario.updateWorkflowRule({
  //     ruleId: rule.id,
  //     fallthrough: modifiedRule.fallthrough,
  //   });
  // }
}
