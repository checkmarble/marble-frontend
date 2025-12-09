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
  falsePositiveRatio: ValueWithOptionalCompare;
  repeatRatio: ValueWithOptionalCompare;
};

const adaptRuleHit = (value: RuleHitTableResponseDto): RuleHitTableResponse => {
  return {
    ruleName: value.rule_name,
    hitCount: { value: value.hit_count },
    hitRatio: { value: value.hit_ratio },
    distinctPivots: { value: value.distinct_pivots },
    falsePositiveRatio: { value: value.false_positive_ratio },
    repeatRatio: {
      value: value.hit_count > 0 ? value.repeat_ratio : 0,
    },
  };
};

const createCompareValue = (value: number, compare: number): ValueWithOptionalCompare => {
  return {
    value,
    compare,
  };
};

export const adaptRuleHitTable = (
  values: RuleHitTableResponseDto[],
  compareValues: RuleHitTableResponseDto[] | undefined,
): RuleHitTableResponse[] => {
  const rulesMap = new Map<string, RuleHitTableResponse>();

  values.forEach((value) => {
    rulesMap.set(value.rule_name, adaptRuleHit(value));
  });

  compareValues?.forEach((compareValue) => {
    const rule = rulesMap.get(compareValue.rule_name);
    if (rule) {
      rulesMap.set(compareValue.rule_name, {
        ...rule,
        hitCount: createCompareValue(rule.hitCount.value, compareValue.hit_count),
        hitRatio: createCompareValue(rule.hitRatio.value, compareValue.hit_ratio),
        distinctPivots: createCompareValue(rule.distinctPivots.value, compareValue.distinct_pivots),
        falsePositiveRatio: createCompareValue(rule.falsePositiveRatio.value, compareValue.false_positive_ratio),
        repeatRatio: createCompareValue(
          rule.repeatRatio.value,
          compareValue.hit_count > 0 ? compareValue.repeat_ratio : 0,
        ),
      });
    }
  });

  return Array.from(rulesMap.values());
};
