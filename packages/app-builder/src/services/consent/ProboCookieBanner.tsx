import { getClientEnv } from '@app-builder/utils/environment';
import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';

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

/**
 * Probo cookie consent banner + floating cookie-settings reopen link.
 *
 * Rendered client-only from the root shell, outside the i18n/theme providers —
 * everything it needs comes in as props. The web components are registered lazily
 * so the ~120 KB SDK stays out of the root chunk. Registration is idempotent in
 * the SDK, which also makes StrictMode's double-effect safe.
 */
export function ProboCookieBanner({ locale, dir }: { locale: string; dir: 'ltr' | 'rtl' }) {
  const configured = isProboBannerConfigured();
  const [registrationAttempt, setRegistrationAttempt] = useState(0);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    let bannerReady = false;
    const onBannerReady = () => {
      bannerReady = true;
    };
    document.addEventListener('probo-ready', onBannerReady);
    startConsentGatedSegment();

    const timeout = window.setTimeout(() => {
      if (!bannerReady) {
        Sentry.captureMessage('Probo cookie banner: banner configuration did not load', 'warning');
        if (registrationAttempt === 0) setRegistrationAttempt(1);
      }
    }, 8_000);

    void import('@probo/cookie-banner')
      .then(({ registerCookieBanner }) => {
        if (!cancelled) registerCookieBanner();
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        Sentry.captureException(error);
        // A stale deployment asset or transient network failure should not leave the
        // page permanently without a consent control.
        if (registrationAttempt === 0) {
          window.setTimeout(() => setRegistrationAttempt(1), 1_000);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      document.removeEventListener('probo-ready', onBannerReady);
    };
  }, [configured, registrationAttempt]);

  const bannerId = getClientEnv('PROBO_BANNER_ID');
  const baseUrl = getClientEnv('PROBO_BANNER_BASE_URL');
  if (!bannerId || !baseUrl) return null;
  // Probo 0.17.0 does not react to attributes after connection. It only ships
  // French among Marble's non-English locales, so use its English fallback for Arabic.
  const proboLocale = locale === 'fr' ? 'fr' : 'en';

  return (
    <>
      <probo-cookie-banner
        key={`${proboLocale}-${dir}-${registrationAttempt}`}
        banner-id={bannerId}
        base-url={baseUrl}
        // The component's shadow tree inherits its host's direction, so force its
        // English fallback to remain LTR while still mirroring its screen position.
        dir="ltr"
        lang={proboLocale}
        // the banner positions itself inside its shadow root, so RTL needs the
        // mirrored position attribute rather than a CSS override
        position={dir === 'rtl' ? 'bottom-right' : 'bottom-left'}
        // no gtag/GTM on this site — keep the SDK away from window.dataLayer
        gcm-enabled="false"
      />
      {/* Persistent reopen control (statutory "Your Privacy Choices" under CCPA).
          Childless: the SDK fills in a localized label and hides it until ready. */}
      <div className="fixed bottom-20 start-xs z-30">
        <probo-settings-link className="text-xs text-grey-secondary hover:text-grey-primary" />
      </div>
    </>
  );
}
