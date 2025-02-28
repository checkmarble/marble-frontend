import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
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
    Sentry.httpClientIntegration(),
  ],
  beforeSend: (event, hint) => {
    if (getClientEnv('ENV') === 'development') {
      console.error(hint.originalException || hint.syntheticException);
      return null; // this drops the event and nothing will be sent to sentry
    }
    if (isBrowserExtensionError(hint.originalException)) {
      return null;
    }
    return event;
  },
  ignoreErrors: [
    // Add any other errors you want to ignore
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.2,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [getClientEnv('MARBLE_APP_URL'), getClientEnv('MARBLE_API_URL')],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
});

function isBrowserExtensionError(exception: unknown): boolean {
  if (exception instanceof Error && exception.stack) {
    const extensionPattern = /chrome-extension:|moz-extension:|extensions|anonymous scripts/;
    return extensionPattern.test(exception.stack);
  }

  return false;
}

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

void hydrate();
