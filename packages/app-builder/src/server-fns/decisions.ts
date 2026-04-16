import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getDecisionFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ decisionId: z.string() }))
  .handler(async ({ context, data }) => {
    const decision = await context.authInfo.decision.getDecisionById(data.decisionId);
    return { decision };
  });

export const listScheduledExecutionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const scheduledExecutions = await context.authInfo.decision.listScheduledExecutions();
    return { scheduledExecutions };
  });
