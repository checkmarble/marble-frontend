import { createCsrfMiddleware, createStart } from '@tanstack/react-start';
import { convertRedirectErrorToExceptionMiddleware, serverFnLoggingMiddleware } from './middlewares/globals';
import { requestLoggingMiddleware } from './middlewares/request-logging';
import { securityHeadersMiddleware } from './middlewares/security-headers';
import { shortUUIDRedirectMiddleware } from './middlewares/short-uuid-redirect';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [
      csrfMiddleware,
      requestLoggingMiddleware,
      shortUUIDRedirectMiddleware,
      securityHeadersMiddleware,
    ],
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware, serverFnLoggingMiddleware],
  };
});
