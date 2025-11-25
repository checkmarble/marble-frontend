import type { DecisionsScoreDistributionResponseDto } from 'marble-api';

export type DecisionsScoreDistributionPoint = {
  score: number;
  decisions: number;
  outcome?: 'approve' | 'review' | 'blockAndReview' | 'decline';
};

export type DecisionsScoreDistribution = Array<{ x: number; y: number }>;

export const adaptDecisionsScoreDistribution = (
  values: DecisionsScoreDistributionResponseDto[],
): DecisionsScoreDistribution => {
  if (!values || values.length === 0) {
    return [];
  }

  const firstScore = values[0]?.score ?? 0;
  const lastScore = values[values.length - 1]?.score ?? 0;
  const scoreDomainSize = lastScore - firstScore;

  const numberOfBuckets = scoreDomainSize % 20 === 0 ? 20 : 10;
  const bucketSize = Math.ceil(scoreDomainSize / numberOfBuckets);

  const totalDecisions = values.reduce((acc, v) => acc + v.decisions, 0);

  return Array.from({ length: numberOfBuckets }, (_, i) => ({
    x: firstScore + i * bucketSize,
    y: totalDecisions
      ? (100 * values.slice(i * bucketSize, (i + 1) * bucketSize).reduce((acc, v) => acc + v.decisions, 0)) /
        totalDecisions
      : 0,
  }));
};
