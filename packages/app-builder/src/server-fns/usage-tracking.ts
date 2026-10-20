import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin, isMarbleAdmin } from '@app-builder/models/user';
import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const usageTrackingMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(({ next, context }) => {
    const { user } = context.authInfo;
    if (context.appConfig.isManagedMarble || (!isAdmin(user) && !isMarbleAdmin(user))) {
      throw new Error('Backend usage tracking can only be changed by self-hosted administrators');
    }
    return next();
  });

export const getUsageTrackingFn = createServerFn({ method: 'GET' })
  .middleware([usageTrackingMiddleware])
  .handler(({ context }) => ({ enabled: context.appConfig.features.segment }));

export const updateUsageTrackingFn = createServerFn({ method: 'POST' })
  .middleware([usageTrackingMiddleware])
  .validator(z.object({ enabled: z.boolean() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateUsageTracking(data);
    const appConfig = await context.services.appConfigRepository.getAppConfig();
    return { enabled: appConfig.features.segment };
  });
