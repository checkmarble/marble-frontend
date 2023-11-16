import { getClientEnv } from '@app-builder/utils/environment.client';
import { AnalyticsBrowser } from '@segment/analytics-next';

export const analytics = AnalyticsBrowser.load({
  writeKey: getClientEnv('SEGMENT_WRITE_KEY'),
});
