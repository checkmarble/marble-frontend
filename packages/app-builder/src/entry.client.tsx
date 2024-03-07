import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import { httpClientIntegration } from '@sentry/integrations';
import * as Sentry from '@sentry/remix';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { clientServices } from './services/init.client';
import { getClientEnv } from './utils/environment';

Sentry.init({
  dsn: getClientEnv('SENTRY_DSN'),
  environment: getClientEnv('SENTRY_ENVIRONMENT'),
  integrations: [
    Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    // Replay is only available in the client
    Sentry.replayIntegration(),
    httpClientIntegration(),
  ],
  beforeSend: (event, hint) => {
    if (getClientEnv('ENV') === 'development') {
      console.error(hint.originalException || hint.syntheticException);
      return null; // this drops the event and nothing will be sent to sentry
    }
    return event;
  },

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    getClientEnv('MARBLE_APP_DOMAIN'),
    getClientEnv('MARBLE_API_DOMAIN_CLIENT'),
    getClientEnv('MARBLE_API_DOMAIN_SERVER'),
  ],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

async function hydrate() {
  const { i18nextClientService } = clientServices;
  const i18next = await i18nextClientService.getI18nextClientInstance();

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18next}>
          <RemixBrowser />
        </I18nextProvider>
      </StrictMode>,
    );
  });
}

if (window.requestIdleCallback) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  window.setTimeout(hydrate, 1);
}
