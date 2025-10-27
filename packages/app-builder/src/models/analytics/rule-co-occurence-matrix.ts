import { type RuleCoOccurrenceMatrixResponseDto } from 'marble-api';

export type RuleCoOccurrenceMatrixResponse = {
  ruleX: string;
  ruleXName: string;
  ruleY: string;
  ruleYName: string;
  hits: number;
};

export const adaptRuleCoOccurrenceMatrix = (
  data: RuleCoOccurrenceMatrixResponseDto[] | null,
): RuleCoOccurrenceMatrixResponse[] | null => {
  return (
    data?.map((d) => ({
      ruleX: d.rule_x,
      ruleXName: d.rule_x_name,
      ruleY: d.rule_y,
      ruleYName: d.rule_y_name,
      hits: d.hits,
    })) ?? null
  );
};
