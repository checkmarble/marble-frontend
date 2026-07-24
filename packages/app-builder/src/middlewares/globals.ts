import { setRequestServerFn } from '@app-builder/utils/logger.server';
import { isRedirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

export const convertRedirectErrorToExceptionMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const result = await next();
    if ('error' in result && isRedirect(result.error)) {
      throw result.error;
    }
    return result;
  },
);

export const serverFnLoggingMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next, serverFnMeta }) => {
    setRequestServerFn(serverFnMeta.name);
    return next();
  },
);
