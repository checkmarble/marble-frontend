import type { RuleHitTableResponseDto } from 'marble-api';

export type RuleHitTableResponse = {
  ruleName: string;
  hitCount: number;
  hitRatio: number;
  distinctPivots: number;
  repeatRatio: number;
};

export const adaptRuleHitTable = (val: RuleHitTableResponseDto[]): RuleHitTableResponse[] => {
  return val.map((v) => ({
    ruleName: v.rule_name,
    hitCount: v.hit_count,
    hitRatio: v.hit_ratio,
    distinctPivots: v.distinct_pivots,
    repeatRatio: v.hit_count > 0 ? v.repeat_ratio : 0,
  }));
};
