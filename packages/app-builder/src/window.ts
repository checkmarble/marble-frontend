export {};

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS;
  }
}
