import { getServerEnv } from '@app-builder/utils/environment.server';
import { min } from '@segment/snippet';

export function getSegmentScript() {
  return min({
    apiKey: getServerEnv('SEGMENT_WRITE_KEY'),

    // TODO(GDPR): uncomment to lazy load segment after GDPR consent
    // Ressource to implement in house cookie consent banner: https://github.com/remix-run/examples/tree/main/gdpr-cookie-consent
    // load: false,

    // page tracking is done manually
    page: false,
  });
}
