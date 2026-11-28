import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { adaptScenarioRulesLatestVersion, adaptWorkflow, type Rule } from '@app-builder/models/scenario/workflow';
import { ruleSchema } from '@app-builder/models/update-workflow-rule';
import { listInboxesMetadata } from '@app-builder/server/inboxes';
import { createWorkflowAction, createWorkflowRule, getScenario } from '@app-builder/server/scenarios';
import { syncWorkflowRule } from '@app-builder/server/workflow-rules';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const listWorkflowInboxesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return listInboxesMetadata(context.api);
  });

export const listWorkflowRulesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }) => {
    const { triggerObjectType } = await getScenario(context.api, {
      scenarioId: data.scenarioId,
    });
    const workflow = adaptWorkflow(await context.api.listWorkflows(data.scenarioId));
    return { workflow, triggerObjectType };
  });

export const getWorkflowLatestReferencesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }) => {
    const references = (await context.api.scenarioRuleLatestVersions(data.scenarioId)).map(
      adaptScenarioRulesLatestVersion,
    );
    return references.sort((a, b) => Number(b.latestVersion) - Number(a.latestVersion));
  });

export const reorderWorkflowsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), ruleIds: z.array(z.string()) }))
  .handler(async ({ context, data }) => {
    await context.api.reorderWorkflows(data.scenarioId, data.ruleIds);
  });

export const createWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), name: z.string().min(1), fallthrough: z.boolean() }))
  .handler(async ({ context, data }) => {
    const rule = await createWorkflowRule(context.api, {
      scenarioId: data.scenarioId,
      name: data.name,
      fallthrough: data.fallthrough,
    });

    const action = await createWorkflowAction(context.api, {
      ruleId: rule.id,
      action: {
        id: 'default-disabled-action',
        action: 'DISABLED',
      },
    });

    return action;
  });

export const updateWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(ruleSchema)
  .handler(async ({ context, data }) => {
    // `ruleSchema` validates the condition AST as `unknown`; `Rule` types it as `AstNode`.
    await syncWorkflowRule(context.api, data as Rule);
  });

export const deleteWorkflowRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ ruleId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.api.deleteWorkflowRule(data.ruleId);
  });
