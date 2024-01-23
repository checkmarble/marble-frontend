import { min } from '@segment/snippet';

export function getSegmentScript(apiKey: string) {
  return min({
    apiKey,

    // TODO(GDPR): uncomment to lazy load segment after GDPR consent
    // Ressource to implement in house cookie consent banner: https://github.com/remix-run/examples/tree/main/gdpr-cookie-consent
    // load: false,

    // page tracking is done manually
    page: false,
  });
}
