import { checkEnv } from '@app-builder/utils/environment';
import { createMiddleware } from '@tanstack/react-start';

// The env is fixed for the process lifetime: once valid, there is nothing left to check.
let envChecked = false;

export const envCheckMiddleware = createMiddleware().server(({ next }) => {
  if (!envChecked) {
    checkEnv();
    envChecked = true;
  }
  return next();
});
