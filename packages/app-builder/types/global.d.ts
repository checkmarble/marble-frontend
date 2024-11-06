import { type AnalyticsSnippet } from '@segment/analytics-next';

declare global {
  interface Window {
    /**
     * Segment
     */
    analytics?: AnalyticsSnippet;
  }
}
