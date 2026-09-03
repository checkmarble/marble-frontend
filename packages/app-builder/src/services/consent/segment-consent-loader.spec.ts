import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ConsentCallback = (consent: Record<string, boolean>) => void;

let consentCallback: ConsentCallback | undefined;

vi.mock('@probo/cookie-banner/consent', () => ({
  getConsent: () => ({
    subscribe: (callback: ConsentCallback) => {
      consentCallback = callback;
      return vi.fn();
    },
  }),
}));

describe('startConsentGatedSegment', () => {
  beforeEach(() => {
    vi.resetModules();
    consentCallback = undefined;
    window.analytics = undefined;
    document.cookie = 'ajs_user_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    localStorage.clear();
  });

  afterEach(() => {
    window.analytics = undefined;
    localStorage.clear();
  });

  it('removes identifiers left by the previous eager Segment implementation when consent is denied', async () => {
    document.cookie = 'ajs_user_id=existing; path=/';
    localStorage.setItem('ajs_anonymous_id', 'existing');
    window.analytics = makeAnalyticsStub();

    const { startConsentGatedSegment } = await import('./segment-consent-loader');
    startConsentGatedSegment();
    consentCallback?.({ analytics: false });

    expect(document.cookie).not.toContain('ajs_user_id=');
    expect(localStorage.getItem('ajs_anonymous_id')).toBeNull();
    expect(window.analytics).toBeUndefined();
  });

  it('discards pre-consent calls and asks the app to send current tracking state after a later grant', async () => {
    const analytics = makeAnalyticsStub([
      ['identify', 'previous-user'],
      ['page', 'previous-page'],
    ]);
    const onConsentGranted = vi.fn();
    window.analytics = analytics;
    window.addEventListener('segment-consent-granted', onConsentGranted);

    const { startConsentGatedSegment } = await import('./segment-consent-loader');
    startConsentGatedSegment();
    consentCallback?.({ analytics: false });
    consentCallback?.({ analytics: true });

    expect(analytics).toHaveLength(0);
    expect(analytics.load).toHaveBeenCalledWith('WRITE_KEY_123');
    expect(onConsentGranted).toHaveBeenCalledOnce();
    window.removeEventListener('segment-consent-granted', onConsentGranted);
  });
});

function makeAnalyticsStub(buffer: unknown[][] = []) {
  return Object.assign(buffer, {
    _writeKey: 'WRITE_KEY_123',
    initialized: false,
    load: vi.fn(),
    reset: vi.fn(),
  }) as unknown as NonNullable<typeof window.analytics>;
}
