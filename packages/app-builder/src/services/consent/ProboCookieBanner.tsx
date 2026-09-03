import { getClientEnv } from '@app-builder/utils/environment';
import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { startConsentGatedSegment } from './segment-consent-loader';

let bannerReady = false;
const bannerReadyListeners = new Set<() => void>();

/**
 * True when this deployment configures the Probo cookie consent banner. The same
 * condition defers Segment loading server-side (see server-fns/root.ts, which
 * exposes the vars in window.ENV only when the base URL parsed), so banner
 * rendering and consent gating can never disagree.
 */
function isProboBannerConfigured() {
  return Boolean(getClientEnv('PROBO_BANNER_ID') && getClientEnv('PROBO_BANNER_BASE_URL'));
}

/** Whether the SDK has loaded a published Probo banner on this page. */
export function useProboBannerReady() {
  const [ready, setReady] = useState(() => bannerReady);

  useEffect(() => {
    const onReady = () => setReady(true);
    bannerReadyListeners.add(onReady);
    return () => {
      bannerReadyListeners.delete(onReady);
    };
  }, []);

  return ready;
}

/** Toggles Probo's preference panel from a Marble-owned control. */
export function toggleProboPreferences() {
  const root = document
    .querySelector('probo-cookie-banner')
    ?.shadowRoot?.querySelector<ProboCookieBannerRoot>('probo-cookie-banner-root');

  if (root?.state && root.state !== 'hidden') {
    root.setState('hidden');
    return;
  }

  document.dispatchEvent(new Event('probo-open-preferences'));
}

/**
 * Probo cookie consent banner + floating cookie-settings reopen link.
 *
 * Rendered client-only from the root shell. The web components are registered lazily
 * so the ~120 KB SDK stays out of the root chunk. Registration is idempotent in the
 * SDK, which also makes StrictMode's double-effect safe.
 */
export function ProboCookieBanner() {
  const { i18n } = useTranslation();
  const configured = isProboBannerConfigured();
  const [registrationAttempt, setRegistrationAttempt] = useState(0);
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const dir = i18n.dir(locale);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    let bannerReady = false;
    const onBannerReady = () => {
      bannerReady = true;
      markBannerReady();
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
      {/* Probo validates that this element exists. Marble renders the visible control
          on /account instead, so the SDK-owned text never overlaps the application UI. */}
      <probo-settings-link aria-hidden tabIndex={-1} className="!hidden" />
    </>
  );
}

function markBannerReady() {
  if (bannerReady) return;
  bannerReady = true;
  for (const listener of bannerReadyListeners) listener();
}

interface ProboCookieBannerRoot extends HTMLElement {
  state: string;
  setState(state: 'hidden'): void;
}
