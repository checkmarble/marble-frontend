import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import { clientServices } from './services/init.client';

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
      </StrictMode>
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
