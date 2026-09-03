import { min } from '@segment/snippet';

export function getSegmentScript(apiKey: string, options: { deferLoad: boolean }) {
  return min({
    apiKey,
    // When a cookie consent banner is configured, only the buffering stub is rendered:
    // Segment is loaded once the visitor grants the "analytics" category
    // (see services/consent/segment-consent-loader.ts)
    load: !options.deferLoad,
    // page tracking is done manually
    page: false,
  });
}
