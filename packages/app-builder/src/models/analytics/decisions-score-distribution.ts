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

  const points = Array.from({ length: numberOfBuckets }, (_, i) => {
    return {
      score: firstScore + i * bucketSize,
      decisions: values.slice(i * bucketSize, (i + 1) * bucketSize).reduce((acc, v) => acc + v.decisions, 0),
    };
  });

  const stepSeries = points.map((p) => ({ x: p.score, y: totalDecisions ? (100 * p.decisions) / totalDecisions : 0 }));

  console.log('stepSeries', stepSeries);

  return stepSeries;
};
