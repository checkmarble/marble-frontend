import { createStart } from '@tanstack/react-start';
import { convertRedirectErrorToExceptionMiddleware } from './middlewares/globals';
import { securityHeadersMiddleware } from './middlewares/security-headers';

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [securityHeadersMiddleware],
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware],
  };
});
