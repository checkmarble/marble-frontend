import { getConsent } from '@probo/cookie-banner/consent';

const ANALYTICS_CATEGORY = 'analytics';

let started = false;

/**
 * Bridges the Probo consent manager and the Segment snippet stub rendered with
 * `load: false` (see services/segment/segment.server.ts):
 *
 * - denied before load: the stub is parked off `window.analytics`, so the app's
 *   optional-chained calls are true no-ops — nothing buffers while consent is denied
 * - granted: the stub is restored with its pre-decision buffer discarded, then Segment
 *   receives fresh page and identity calls for the visitor's current state
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
      discardStubBuffer(analytics);
      analytics.load(writeKey);
      loadedThisPage = true;
      window.dispatchEvent(new Event('segment-consent-granted'));
    } else if (loadedThisPage || analytics.initialized) {
      // A reset() queued on a not-yet-initialized stub would be discarded by the
      // reload, so Segment storage is cleared explicitly first.
      clearSegmentStorage();
      void analytics.reset();
      window.location.reload();
    } else {
      // This covers identifiers set before consent gating was introduced too.
      clearSegmentStorage();
      parked = analytics;
      window.analytics = undefined;
    }
  });
}

/**
 * Every queued call happened before consent. The current route and identity are sent
 * after load via the `segment-consent-granted` event, so none of this history is sent.
 */
function discardStubBuffer(analytics: NonNullable<typeof window.analytics>) {
  if (!Array.isArray(analytics)) return;
  analytics.length = 0;
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
