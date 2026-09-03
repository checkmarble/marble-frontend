import { getClientEnv } from '@app-builder/utils/environment';
import { useEffect } from 'react';

import { startConsentGatedSegment } from './segment-consent-loader';

/**
 * True when this deployment configures the Probo cookie consent banner. The same
 * condition defers Segment loading server-side (see server-fns/root.ts, which
 * exposes the vars in window.ENV only when the base URL parsed), so banner
 * rendering and consent gating can never disagree.
 */
export function isProboBannerConfigured() {
  return Boolean(getClientEnv('PROBO_BANNER_ID') && getClientEnv('PROBO_BANNER_BASE_URL'));
}

let setupStarted = false;

/**
 * Probo cookie consent banner + floating cookie-settings reopen link.
 *
 * Rendered client-only from the root shell, outside the i18n/theme providers —
 * everything it needs comes in as props. The web components are registered lazily
 * so the ~120 KB SDK stays out of the root chunk; registration is idempotent
 * (the SDK guards customElements.define) and the sync flag makes the effect safe
 * under StrictMode double-invocation.
 */
export function ProboCookieBanner({ locale, dir }: { locale: string; dir: 'ltr' | 'rtl' }) {
  const configured = isProboBannerConfigured();

  useEffect(() => {
    if (!configured || setupStarted) return;
    setupStarted = true;
    void import('@probo/cookie-banner').then(({ registerCookieBanner }) => {
      registerCookieBanner();
    });
    startConsentGatedSegment();
  }, [configured]);

  const bannerId = getClientEnv('PROBO_BANNER_ID');
  const baseUrl = getClientEnv('PROBO_BANNER_BASE_URL');
  if (!bannerId || !baseUrl) return null;

  return (
    <>
      <probo-cookie-banner
        banner-id={bannerId}
        base-url={baseUrl}
        // Probo ships EN/FR/DE/ES and falls back to the banner's default language
        // for anything else (e.g. `ar`); only the 2-letter code is meaningful
        lang={locale.split('-')[0] ?? locale}
        // the banner positions itself inside its shadow root, so RTL needs the
        // mirrored position attribute rather than a CSS override
        position={dir === 'rtl' ? 'bottom-right' : 'bottom-left'}
        // no gtag/GTM on this site — keep the SDK away from window.dataLayer
        gcm-enabled="false"
      />
      {/* Persistent reopen control (statutory "Your Privacy Choices" under CCPA).
          Childless: the SDK fills in a localized label and hides it until ready. */}
      <div className="fixed bottom-xs start-xs z-30">
        <probo-settings-link className="text-xs text-grey-secondary hover:text-grey-primary" />
      </div>
    </>
  );
}
