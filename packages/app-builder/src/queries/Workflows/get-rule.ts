import { type Rule } from '@app-builder/models/scenario/workflow';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useGetRuleQuery(ruleId: string): UseQueryResult<Rule, Error> {
  return useQuery({
    queryKey: ['workflow-rule', ruleId],
    queryFn: async (): Promise<Rule> => {
      const response = await fetch(`/ressources/workflows/rule/${ruleId}`);
      const data = await response.json();
      return data;
    },
    enabled: true,
  });
}
