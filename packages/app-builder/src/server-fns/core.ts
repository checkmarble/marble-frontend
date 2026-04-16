import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { createServerFn } from '@tanstack/react-start';

export const getAppConfigFn = createServerFn({ method: 'GET' })
  .middleware([servicesMiddleware])
  .handler(async ({ context }) => {
    return context.appConfig;
  });
