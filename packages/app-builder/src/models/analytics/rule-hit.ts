import type { RuleHitTableResponseDto } from 'marble-api';

export type RuleHitTableResponse = {
  ruleName: string;
  hitCount: number;
  hitRatio: number;
  pivotCount: number;
  pivotRatio: number;
};

export const adaptRuleHitTable = (val: RuleHitTableResponseDto[]): RuleHitTableResponse[] => {
  return val.map((v) => ({
    ruleName: v.rule_name,
    hitCount: v.hit_count,
    hitRatio: v.hit_ratio,
    pivotCount: v.pivot_count,
    pivotRatio: v.pivot_ratio,
  }));
};
