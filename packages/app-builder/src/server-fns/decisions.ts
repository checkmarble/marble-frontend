import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getDecisionById, listScheduledExecutions } from '@app-builder/server/decisions';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getDecisionFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ decisionId: z.string() }))
  .handler(async ({ context, data }) => {
    const decision = await getDecisionById(context.api, data.decisionId);
    return { decision };
  });

export const listScheduledExecutionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string().optional() }).optional())
  .handler(async ({ context, data }) => {
    const scheduledExecutions = await listScheduledExecutions(context.api, {
      scenarioId: data?.scenarioId,
    });
    return { scheduledExecutions };
  });

export const cancelScheduledExecutionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scheduledExecutionId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.api.cancelScheduledExecution(data.scheduledExecutionId);
  });
