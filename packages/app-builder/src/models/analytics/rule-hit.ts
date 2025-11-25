import type { RuleHitTableResponseDto } from 'marble-api';

export type ValueWithOptionalCompare = {
  value: number;
  compare?: number;
};
export type RuleHitTableResponse = {
  ruleName: string;
  hitCount: ValueWithOptionalCompare;
  hitRatio: ValueWithOptionalCompare;
  distinctPivots: ValueWithOptionalCompare;
  repeatRatio: ValueWithOptionalCompare;
};

export const adaptRuleHitTable = (values: RuleHitTableResponseDto[][]): RuleHitTableResponse[] => {
  const rulesMap = new Map<string, RuleHitTableResponse>();

  values.forEach((ruleHitResponse, index) =>
    ruleHitResponse.forEach((val) => {
      const rule = rulesMap.get(val.rule_name);
      if (!rule)
        return rulesMap.set(val.rule_name, {
          ruleName: val.rule_name,
          hitCount: { value: val.hit_count },
          hitRatio: { value: val.hit_ratio },
          distinctPivots: { value: val.distinct_pivots },
          repeatRatio: { value: val.hit_count > 0 ? val.repeat_ratio : 0 },
        });

      if (index == 0) {
        return rulesMap.set(val.rule_name, {
          ...rule,
          hitCount: { value: val.hit_count },
          hitRatio: { value: val.hit_ratio },
          distinctPivots: { value: val.distinct_pivots },
          repeatRatio: { value: val.hit_count > 0 ? val.repeat_ratio : 0 },
        });
      }
      return rulesMap.set(val.rule_name, {
        ...rule,
        hitCount: { ...rule.hitCount, compare: val.hit_count },
        hitRatio: { ...rule.hitRatio, compare: val.hit_ratio },
        distinctPivots: { ...rule.distinctPivots, compare: val.distinct_pivots },
        repeatRatio: {
          ...rule.repeatRatio,
          compare: val.hit_count > 0 ? val.repeat_ratio : 0,
        },
      });
    }),
  );
  return Array.from(rulesMap.values());
};
