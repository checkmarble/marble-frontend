import type { OutcomeDto, RuleVsDecisionOutcomeResponseDto } from 'marble-api';
import * as R from 'remeda';
import { type Outcome } from './index';

export type DecisionOutcomesEntry = {
  total: number;
  approve: number;
  review: number;
  decline: number;
  blockAndReview: number;
  unknown: number;
};

export type RuleVsDecisionOutcome = {
  rule: string;
  approve: number;
  review: number;
  decline: number;
  blockAndReview: number;
  unknown: number;
  total: number;
};

const OutcomesMap = new Map<OutcomeDto, Outcome | 'unknown'>([
  ['approve', 'approve'],
  ['review', 'review'],
  ['decline', 'decline'],
  ['block_and_review', 'blockAndReview'],
  ['unknown', 'unknown'],
]);

export type RuleVsDecisionOutcomeEntry = Map<string, DecisionOutcomesEntry>;

export const adaptRuleVsDecisionOutcome = (
  val: RuleVsDecisionOutcomeResponseDto[],
): RuleVsDecisionOutcome[] => {
  const grouped = R.pipe(
    val,
    R.groupBy((v) => v.rule_name),
    R.mapValues((items) => {
      const counts = items.reduce<DecisionOutcomesEntry>(
        (acc, v) => {
          const outcome = OutcomesMap.get(v.outcome);
          if (outcome) {
            acc[outcome] += v.decisions;
          } else {
            acc.unknown += v.decisions;
          }
          acc.total += v.decisions;
          return acc;
        },
        { total: 0, approve: 0, review: 0, decline: 0, blockAndReview: 0, unknown: 0 },
      );

      const t = counts.total || 0;
      return {
        approve: t ? (100 * counts.approve) / t : 0,
        review: t ? (100 * counts.review) / t : 0,
        decline: t ? (100 * counts.decline) / t : 0,
        blockAndReview: t ? (100 * counts.blockAndReview) / t : 0,
        unknown: t ? (100 * counts.unknown) / t : 0,
        total: t,
      };
    }),
  );

  return Object.entries(grouped).map(([rule, outcomes]) => ({
    rule,
    ...outcomes,
  }));
};
