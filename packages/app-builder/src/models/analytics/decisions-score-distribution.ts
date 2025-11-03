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

function classifyOutcome(
  score: number,
  thresholds?: { review?: number; blockAndReview?: number; decline?: number },
): DecisionsScoreDistributionPoint['outcome'] {
  if (!thresholds) return undefined;
  const review = thresholds.review ?? undefined;
  const blockAndReview = thresholds.blockAndReview ?? undefined;
  const decline = thresholds.decline ?? undefined;

  if (decline != null && score >= decline) return 'decline';
  if (blockAndReview != null && score >= blockAndReview) return 'blockAndReview';
  if (review != null && score >= review) return 'review';
  return 'approve';
}

export const adaptDecisionsScoreDistribution = (
  val: DecisionsScoreDistributionResponseDto[],
  thresholds?: { review?: number; blockAndReview?: number; decline?: number },
): DecisionsScoreDistribution => {
  const points: DecisionsScoreDistributionPoint[] = val.map((v) => ({
    score: v.score,
    decisions: v.decisions,
    outcome: classifyOutcome(v.score, thresholds),
  }));

  // Build step function series aggregated by thresholds/outcomes
  const totalDecisions = points.reduce((acc, cur) => acc + cur.decisions, 0);
  const computedThresholds = thresholds ?? {};

  const approveCount = points
    .filter((p) => p.outcome === 'approve')
    .reduce((a, b) => a + b.decisions, 0);
  const reviewCount = points
    .filter((p) => p.outcome === 'review')
    .reduce((a, b) => a + b.decisions, 0);
  const declineCount = points
    .filter((p) => p.outcome === 'decline')
    .reduce((a, b) => a + b.decisions, 0);

  const approvePct = totalDecisions ? (approveCount / totalDecisions) * 100 : 0;
  const reviewPct = totalDecisions ? (reviewCount / totalDecisions) * 100 : 0;
  const declinePct = totalDecisions ? (declineCount / totalDecisions) * 100 : 0;

  const allScores = points.map((p) => p.score);
  const minScore = allScores.length ? Math.min(...allScores) : 0;
  const maxScore = allScores.length ? Math.max(...allScores) : 0;
  const minX = Math.min(0, minScore);
  const maxX = Math.max(
    maxScore,
    computedThresholds.decline ??
      computedThresholds.blockAndReview ??
      computedThresholds.review ??
      0,
  );

  const stepSeries: Array<{ x: number; y: number }> = [];
  if (
    !totalDecisions ||
    (!computedThresholds.review &&
      !computedThresholds.blockAndReview &&
      !computedThresholds.decline)
  ) {
    // Fallback: show raw per-score distribution if thresholds are not available
    stepSeries.push(
      ...[...points]
        .sort((a, b) => a.score - b.score)
        .map((d) => ({ x: d.score, y: totalDecisions ? (d.decisions / totalDecisions) * 100 : 0 })),
    );
  } else {
    let currentY = 100;
    stepSeries.push({ x: minX, y: currentY });

    if (computedThresholds.review != null) {
      currentY = 100 - approvePct;
      stepSeries.push({ x: computedThresholds.review, y: currentY });
    }
    if (computedThresholds.blockAndReview != null) {
      currentY = 100 - approvePct - reviewPct;
      stepSeries.push({ x: computedThresholds.blockAndReview, y: currentY });
    }
    if (computedThresholds.decline != null) {
      currentY = declinePct;
      stepSeries.push({ x: computedThresholds.decline, y: currentY });
    }

    stepSeries.push({ x: maxX, y: currentY });
  }

  return { points, thresholds: computedThresholds, stepSeries };
};
