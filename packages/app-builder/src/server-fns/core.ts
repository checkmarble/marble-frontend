import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { createServerFn } from '@tanstack/react-start';

export const getAppConfigFn = createServerFn({ method: 'GET' })
  .middleware([appConfigMiddleware])
  .handler(async ({ context }) => {
    return context.appConfig;
  });
