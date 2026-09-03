import { getConsent } from '@probo/cookie-banner/consent';
import * as Sentry from '@sentry/react';

const ANALYTICS_CATEGORY = 'analytics';
const CONSENT_RESOLUTION_TIMEOUT_MS = 8_000;

let started = false;

/**
 * Bridges the Probo consent manager and the Segment snippet stub rendered with
 * `load: false` (see services/segment/segment.server.ts):
 *
 * - denied before load: the stub is parked off `window.analytics`, so the app's
 *   optional-chained calls are true no-ops — nothing buffers while consent is denied
 * - granted: the stub is restored, the pre-decision buffer compacted, and Segment
 *   loaded with the write key the snippet already embeds
 * - revoked after load: Segment storage is cleared and the page reloaded, since
 *   analytics.js has no unload API
 */
export function startConsentGatedSegment() {
  if (started) return;
  started = true;

  let parked: typeof window.analytics;
  let loadedThisPage = false;

  getConsent().subscribe((consent) => {
    const analytics = window.analytics ?? parked;
    if (!analytics) return; // Segment disabled on this deployment

    if (consent[ANALYTICS_CATEGORY]) {
      if (loadedThisPage || analytics.initialized) return;
      const writeKey = analytics._writeKey;
      if (!writeKey) return;
      window.analytics = analytics;
      parked = undefined;
      compactStubBuffer(analytics);
      analytics.load(writeKey);
      loadedThisPage = true;
    } else if (loadedThisPage || analytics.initialized) {
      // A reset() queued on a not-yet-initialized stub would be discarded by the
      // reload, so Segment storage is cleared explicitly first.
      clearSegmentStorage();
      void analytics.reset();
      window.location.reload();
    } else {
      parked = analytics;
      window.analytics = undefined;
    }
  });

  // Fail-closed is correct for undecided visitors, but if the banner config never
  // resolves, previously-consenting visitors silently lose analytics — surface it.
  window.setTimeout(() => {
    if (!getConsent().ready) {
      Sentry.captureMessage('Probo cookie banner: consent state not resolved', 'warning');
    }
  }, CONSENT_RESOLUTION_TIMEOUT_MS);
}

/**
 * Pre-load, the snippet stub is a real Array of buffered `[method, ...args, context]`
 * calls, where `context` carries the URL captured at call time. Everything buffered
 * before the visitor answered the banner is pre-consent history and must not be
 * flushed — keep only the identification and the page view for the page the visitor
 * is still on.
 */
function compactStubBuffer(analytics: NonNullable<typeof window.analytics>) {
  if (!Array.isArray(analytics)) return;
  const stub = analytics as unknown[][];
  const identify = stub.find((call) => call[0] === 'identify');
  const currentPage = stub.findLast((call) => call[0] === 'page' && call.some(isCurrentPageContext));
  stub.length = 0;
  if (identify) stub.push(identify);
  if (currentPage) stub.push(currentPage);
}

function isCurrentPageContext(arg: unknown): boolean {
  if (typeof arg !== 'object' || arg === null) return false;
  const context = arg as { __t?: unknown; u?: unknown };
  return context.__t === 'bpc' && context.u === window.location.href;
}

/** ajs_* cookies may live on the current host or a parent domain — expire all variants. */
function clearSegmentStorage() {
  const hostParts = window.location.hostname.split('.');
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=')[0];
    if (!name?.startsWith('ajs_')) continue;
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = expired;
    for (let i = 0; i < hostParts.length - 1; i++) {
      document.cookie = `${expired}; domain=.${hostParts.slice(i).join('.')}`;
    }
  }
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('ajs_')) window.localStorage.removeItem(key);
    }
  } catch {
    // localStorage unavailable — nothing to clear
  }
}
