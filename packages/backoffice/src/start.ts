import { createCsrfMiddleware, createStart } from '@tanstack/react-start';
import { convertRedirectErrorToExceptionMiddleware } from './middlewares/globals';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware],
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware],
  };
});
