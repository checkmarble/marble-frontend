import type { DecisionsScoreDistributionResponseDto } from 'marble-api';

export type DecisionsScoreDistributionResponse = {
  score: number;
  decisions: number;
};

export const adaptDecisionsScoreDistribution = (
  val: DecisionsScoreDistributionResponseDto[],
): DecisionsScoreDistributionResponse[] => {
  return val.map((v) => ({
    score: v.score,
    decisions: v.decisions,
  }));
};
