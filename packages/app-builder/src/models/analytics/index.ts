export * from './decisions-outcomes-perday';
export * as legacyAnalytics from './legacy-analytics';

export type Outcome = 'approve' | 'review' | 'blockAndReview' | 'decline';
export type DecisionsFilter = Map<Outcome, boolean>;

export const outcomeColors: Record<Outcome, string> = {
  approve: '#89D4AE',
  review: '#FBDD82',
  blockAndReview: '#FFECE6',
  decline: '#E99B8E',
};
