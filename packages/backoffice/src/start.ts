import { createStart } from '@tanstack/react-start';
import { convertRedirectErrorToExceptionMiddleware } from './middlewares/globals';

export const startInstance = createStart(() => {
  return {
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware],
  };
});
