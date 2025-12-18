import { J as protectArray } from "./services-middleware-DR8Hua1Y.js";
import { o as object, f_ as record, fD as lazy, s as string, k as array, d as any, l as discriminatedUnion, m as literal, _ as _enum, p as boolean } from "./short-uuid-MIi3jWzx.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
const astNodeSchema = object({
  id: string().optional(),
  name: string().nullish(),
  constant: any().optional(),
  children: protectArray(array(lazy(() => astNodeSchema))).optional(),
  namedChildren: record(
    string(),
    lazy(() => astNodeSchema)
  ).optional()
});
const workflowConditionSchema = object({
  id: string()
}).and(
  discriminatedUnion("function", [
    object({
      function: literal("always")
    }),
    object({
      function: literal("never")
    }),
    object({
      function: literal("outcome_in"),
      params: protectArray(array(_enum(["approve", "review", "decline", "block_and_review", "unknown"])))
    }),
    object({
      function: literal("rule_hit"),
      params: object({
        ruleIds: protectArray(array(string()))
      })
    }),
    object({
      function: literal("payload_evaluates"),
      params: object({
        expression: astNodeSchema
      })
    })
  ])
);
const workflowActionSchema = object({
  id: string()
}).and(
  discriminatedUnion("action", [
    object({
      action: literal("DISABLED")
    }),
    object({
      action: _enum(["CREATE_CASE", "ADD_TO_CASE_IF_POSSIBLE"]),
      params: object({
        inboxId: string(),
        anyInbox: boolean().optional(),
        titleTemplate: astNodeSchema.optional(),
        tagIds: protectArray(array(string())).optional()
      })
    })
  ])
);
const ruleSchema = object({
  id: string(),
  name: string().min(1, "Rule name is required"),
  fallthrough: boolean(),
  conditions: protectArray(array(workflowConditionSchema)),
  actions: protectArray(array(workflowActionSchema).length(1, "Exactly one action is required"))
});
function validateUpdateWorkflowRuleRequest(data) {
  return ruleSchema.parse(data);
}
const getNewItems = (originalItems, modifiedItems) => new Map([...modifiedItems].filter(([id]) => !originalItems.has(id)));
const getMissingItems = (originalItems, modifiedItems) => new Map([...originalItems].filter(([id]) => !modifiedItems.has(id)));
const getModifiedItems = (originalItems, modifiedItems) => new Map(
  [...modifiedItems].filter(([id]) => originalItems.has(id)).filter(([id, value]) => !t(value, originalItems.get(id)))
);
async function updateWorkflowRule(scenario, rule) {
  const modifiedRule = validateUpdateWorkflowRuleRequest(rule);
  const originalRule = await scenario.getWorkflowRule({ ruleId: rule.id });
  const originalConditions = new Map(
    originalRule.conditions.map((condition) => [condition.id, condition])
  );
  const modifiedConditions = new Map(
    modifiedRule.conditions.map((condition) => [condition.id, condition])
  );
  const deleteMissingConditionsPromises = Array.from(
    getMissingItems(originalConditions, modifiedConditions).values()
  ).map(
    (condition) => scenario.deleteWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id
    })
  );
  await Promise.all(deleteMissingConditionsPromises);
  const createNewConditionsPromises = Array.from(getNewItems(originalConditions, modifiedConditions).values()).map(
    (condition) => scenario.createWorkflowCondition({
      ruleId: rule.id,
      condition
    })
  );
  await Promise.all(createNewConditionsPromises);
  const updateModifiedConditionsPromises = Array.from(
    getModifiedItems(originalConditions, modifiedConditions).values()
  ).map(
    (condition) => scenario.updateWorkflowCondition({
      ruleId: rule.id,
      conditionId: condition.id,
      condition
    })
  );
  await Promise.all(updateModifiedConditionsPromises);
  const originalAction = originalRule.actions[0];
  const modifiedAction = modifiedRule.actions[0];
  if (!originalAction && modifiedAction) {
    await scenario.createWorkflowAction({
      ruleId: rule.id,
      action: modifiedAction
    });
  }
  if (originalAction && modifiedAction && !t(originalAction, modifiedAction)) {
    await scenario.updateWorkflowAction({
      ruleId: rule.id,
      actionId: originalAction.id,
      action: modifiedAction
    });
  }
  if (originalRule.name !== modifiedRule.name || originalRule.fallthrough !== modifiedRule.fallthrough) {
    await scenario.updateWorkflowRule({
      ruleId: rule.id,
      name: modifiedRule.name,
      fallthrough: modifiedRule.fallthrough
    });
  }
}
export {
  ruleSchema as r,
  updateWorkflowRule as u
};
