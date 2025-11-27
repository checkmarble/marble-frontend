import type { Outcome } from '@app-builder/models/analytics';

export const outcomes = ['approve', 'review', 'blockAndReview', 'decline'] as const satisfies Outcome[];

export const OUTCOME_COLORS: Record<Outcome, string> = {
  approve: '#46BB7F',
  review: '#FDBD35',
  blockAndReview: '#FF8533',
  decline: '#DB5F4A',
};
