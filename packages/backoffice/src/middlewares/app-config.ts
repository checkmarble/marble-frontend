import { getAppConfigFn } from '@bo/server-fns/core';
import { createMiddleware } from '@tanstack/react-start';

export const appConfigMiddleware = createMiddleware().server(async ({ next }) => {
  const appConfig = await getAppConfigFn();
  return next({ context: { appConfig } });
});
