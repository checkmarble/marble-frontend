import { type RuleVsDecisionOutcomeResponseDto } from 'marble-api';
import * as R from 'remeda';

// export type RuleVsDecisionOutcome = {
//   ruleName: string;
//   outcome: Outcome | 'unknown';
//   decisions: number;
// };

// export const adaptRuleVsDecisionOutcome = (
//   val: RuleVsDecisionOutcomeResponseDto[],
// ): RuleVsDecisionOutcome[] => {
//   return val.map((v) => ({
//     ruleName: v.rule_name,
//     outcome: R.toCamelCase(v.outcome) as Outcome | 'unknown',
//     decisions: v.decisions,
//   }));
// };

export type DecisionOutcomes = {
  total: number;
  approve: number;
  review: number;
  decline: number;
  block_and_review: number;
  unknown: number;
};

export type RuleVsDecisionOutcome = Map<string, DecisionOutcomes>;

export const adaptRuleVsDecisionOutcome = (
  val: RuleVsDecisionOutcomeResponseDto[],
): RuleVsDecisionOutcome =>
  R.pipe(
    val,
    R.groupBy((v) => v.rule_name),
    R.mapValues((items) => {
      const counts = items.reduce<DecisionOutcomes>(
        (acc, v) => {
          if (v.outcome === 'approve') acc.approve += v.decisions;
          else if (v.outcome === 'review') acc.review += v.decisions;
          else if (v.outcome === 'decline') acc.decline += v.decisions;
          else if (v.outcome === 'block_and_review') acc.block_and_review += v.decisions;
          else acc.unknown += v.decisions;
          acc.total += v.decisions;
          return acc;
        },
        { total: 0, approve: 0, review: 0, decline: 0, block_and_review: 0, unknown: 0 },
      );

      const t = counts.total || 0;
      return {
        total: t,
        approve: t ? (100 * counts.approve) / t : 0,
        review: t ? (100 * counts.review) / t : 0,
        decline: t ? (100 * counts.decline) / t : 0,
        block_and_review: t ? (100 * counts.block_and_review) / t : 0,
        unknown: t ? (100 * counts.unknown) / t : 0,
      } satisfies DecisionOutcomes;
    }),
    (obj) => new Map(Object.entries(obj)),
  );
