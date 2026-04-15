import { getClientEnv } from '@app-builder/utils/environment';
import * as Sentry from '@sentry/react';
import { StartClient } from '@tanstack/react-start/client';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

declare global {
  interface Window {
    __sentryInitialized?: boolean;
  }
}

async function initSentry() {
  // Prevent double initialization on HMR
  if (typeof window !== 'undefined' && window.__sentryInitialized) {
    return;
  }

  let marbleUrl: string | undefined = undefined;
  try {
    const appConfig = await (await import('@app-builder/server-fns/core')).getAppConfigFn();
    marbleUrl = appConfig.urls.marble;
  } catch {
    // Silent — Sentry warning is captured at end of function
  }

  const replay = Sentry.replayIntegration({
    maxReplayDuration: 10 * 60 * 1000,
  });
  window.__sentryReplay = replay;
  window.__sentryInitialized = true;

  Sentry.init({
    dsn: getClientEnv('SENTRY_DSN'),
    environment: getClientEnv('SENTRY_ENVIRONMENT'),
    integrations: [Sentry.browserTracingIntegration(), replay, Sentry.httpClientIntegration()],
    beforeSend: (event, hint) => {
      if (getClientEnv('ENV') === 'development') {
        console.error(hint.originalException || hint.syntheticException);
        return null;
      }
      if (isBrowserExtensionError(hint.originalException)) {
        return null;
      }
      return event;
    },
    tracesSampleRate: 0.2,
    tracePropagationTargets: marbleUrl ? [marbleUrl] : undefined,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });

  if (!marbleUrl) {
    Sentry.captureMessage('App config could not be fetched. Sentry will not be able to trace errors.');
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

  // Initialize the global i18next singleton before hydrateRoot so useTranslation()
  // works immediately on first render. The App() component in __root.tsx falls back
  // to this singleton on the client (getSSRInstance returns undefined client-side).
  // const i18n = await i18nextClientService.getI18nextClientInstance();

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}

void hydrate();
