import { type replayIntegration } from '@sentry/remix';

declare global {
  interface Window {
    __sentryReplay?: ReturnType<typeof replayIntegration>;
    __sentryInitialized?: boolean;
  }
}
export {};
