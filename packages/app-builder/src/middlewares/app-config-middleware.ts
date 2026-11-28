import { getAppConfig } from '@app-builder/server/app-config';
import { createMiddleware } from '@tanstack/react-start';

/** Request middleware providing `context.appConfig`, fetched once per request (`server/app-config.ts`). */
export const appConfigMiddleware = createMiddleware().server(async ({ next, request }) => {
  const appConfig = await getAppConfig(request);
  return next({ context: { appConfig } });
});
