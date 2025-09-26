import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { StrictMode, startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { i18nextClientService } from './services/init.client';
import { getClientEnv } from './utils/environment';
import { getRoute } from './utils/routes';

async function initSentry() {
  let marbleUrl: string | undefined = undefined;
  try {
    const appConfig = await fetch(getRoute('/ressources/app-config')).then((res) => res.json());
    marbleUrl = appConfig.urls.marble;
  } catch {
    // TODO: Silent error, but sentry log is done at the end of the function
  }

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
    tracePropagationTargets: marbleUrl ? [marbleUrl] : undefined,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
  });

  if (!marbleUrl) {
    Sentry.captureMessage(
      'App config could not be fetched. Sentry will not be able to trace errors.',
    );
  }
}

function isBrowserExtensionError(exception: unknown): boolean {
  if (exception instanceof Error && exception.stack) {
    const extensionPattern = /chrome-extension:|moz-extension:|extensions|anonymous scripts/;
    return extensionPattern.test(exception.stack);
  }

  return false;
}

async function hydrate() {
  await initSentry();
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
