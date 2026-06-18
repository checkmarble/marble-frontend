import { createStart } from '@tanstack/react-start';
import { convertRedirectErrorToExceptionMiddleware } from './middlewares/globals';
import { securityHeadersMiddleware } from './middlewares/security-headers';
import { shortUUIDRedirectMiddleware } from './middlewares/short-uuid-redirect';

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [shortUUIDRedirectMiddleware, securityHeadersMiddleware],
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware],
  };
});
