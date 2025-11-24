import type { DecisionsScoreDistributionResponseDto } from 'marble-api';

export type DecisionsScoreDistributionPoint = {
  score: number;
  decisions: number;
  outcome?: 'approve' | 'review' | 'blockAndReview' | 'decline';
};

export type DecisionsScoreDistribution = {
  points: DecisionsScoreDistributionPoint[];
  thresholds: {
    review?: number;
    blockAndReview?: number;
    decline?: number;
  };
  stepSeries: Array<{ x: number; y: number }>;
};

// For testing purpose, increase first 9 points by 1000
const _increaseFirst9Points = (
  values: DecisionsScoreDistributionResponseDto[],
): DecisionsScoreDistributionResponseDto[] =>
  values.map(({ score, decisions }) => ({
    score,
    decisions,
    // decisions: score <= 4 ? decisions * 1000 : decisions,
  }));

export const adaptDecisionsScoreDistribution = (
  values: DecisionsScoreDistributionResponseDto[],
): DecisionsScoreDistribution => {
  if (!values || values.length === 0) {
    return { points: [], thresholds: {}, stepSeries: [] };
  }

  const firstScore = values[0]?.score ?? 0;
  const lastScore = values[values.length - 1]?.score ?? 0;
  const scoreDomainSize = lastScore - firstScore;

  const numberOfBuckets = scoreDomainSize % 20 === 0 ? 20 : 10;
  const bucketSize = scoreDomainSize / numberOfBuckets;

  const totalDecisions = values.reduce((acc, v) => acc + v.decisions, 0);

  const points = Array.from({ length: numberOfBuckets }, (_, i) => {
    return {
      score: i * bucketSize,
      decisions: values.slice(i * bucketSize, (i + 1) * bucketSize).reduce((acc, v) => acc + v.decisions, 0),
    };
  });

  const stepSeries = points.map((p) => ({ x: p.score, y: (100 * p.decisions) / totalDecisions }));

  return { points, thresholds: {}, stepSeries };
};
