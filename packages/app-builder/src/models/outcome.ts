export const knownOutcomes = ['approve', 'review', 'block_and_review', 'decline'] as const;
export type KnownOutcome = (typeof knownOutcomes)[number];
export type ScreeningOutcome = 'review' | 'decline' | 'block_and_review';

export const outcomes = [...knownOutcomes, 'unknown'] as const;
export type Outcome = (typeof outcomes)[number];
