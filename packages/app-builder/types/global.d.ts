import { type AnalyticsSnippet } from '@segment/analytics-next';

declare global {
  interface Window {
    /**
     * Segment
     */
    analytics: AnalyticsSnippet;

    /**
     * Chatlio
     */
    _chatlio?: {
      showOrHide?: () => void;
      configure?: (config: { [key: string]: unknown }) => void;
    };
  }
}
