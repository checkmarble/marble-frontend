import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Rule } from '@app-builder/models/scenario/workflow';
import { ruleSchema, updateWorkflowRule } from '@app-builder/models/update-workflow-rule';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const listWorkflowInboxesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.authInfo.inbox.listInboxesMetadata();
  });

export const listWorkflowRulesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }) => {
    const { triggerObjectType } = await context.authInfo.scenario.getScenario({
      scenarioId: data.scenarioId,
    });
    const workflow = await context.authInfo.scenario.listWorkflowRules({
      scenarioId: data.scenarioId,
    });
    return { workflow, triggerObjectType };
  });

export const getWorkflowLatestReferencesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }) => {
    const references = await context.authInfo.scenario.getLatestRulesReferences(data.scenarioId);
    return references.sort((a, b) => Number(b.latestVersion) - Number(a.latestVersion));
  });

export const reorderWorkflowsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), ruleIds: z.array(z.string()) }))
  .handler(async ({ context, data }) => {
    await context.authInfo.scenario.reorderWorkflows({
      scenarioId: data.scenarioId,
      workflowIds: data.ruleIds,
    });
  });

export const createWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), name: z.string().min(1), fallthrough: z.boolean() }))
  .handler(async ({ context, data }) => {
    const rule = await context.authInfo.scenario.createWorkflowRule({
      scenarioId: data.scenarioId,
      name: data.name,
      fallthrough: data.fallthrough,
    });

    const action = await context.authInfo.scenario.createWorkflowAction({
      ruleId: rule.id,
      action: {
        id: 'default-disabled-action',
        action: 'DISABLED',
      },
    });

    return action;
  });

export const getWorkflowRuleFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ ruleId: z.string() }))
  .handler(async ({ context, data }) => {
    return context.authInfo.scenario.getWorkflowRule({ ruleId: data.ruleId });
  });

export const updateWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(ruleSchema)
  .handler(async ({ context, data }) => {
    await updateWorkflowRule(context.authInfo.scenario, data as Rule);
  });

export const deleteWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ ruleId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.scenario.deleteWorkflowRule({ ruleId: data.ruleId });
  });

export const renameWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ ruleId: z.string(), name: z.string(), fallthrough: z.boolean() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateWorkflowRule(data.ruleId, {
      name: data.name,
      fallthrough: data.fallthrough,
    });
  });

export const deleteWorkflowConditionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ ruleId: z.string(), conditionId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.scenario.deleteWorkflowCondition({
      ruleId: data.ruleId,
      conditionId: data.conditionId,
    });
  });
