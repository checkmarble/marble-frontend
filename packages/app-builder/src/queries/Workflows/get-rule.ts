import { type Rule } from '@app-builder/models/scenario/workflow';
import { getWorkflowRuleFn } from '@app-builder/server-fns/workflows';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useGetRuleQuery(ruleId: string): UseQueryResult<Rule, Error> {
  const getWorkflowRule = useServerFn(getWorkflowRuleFn);

  return useQuery({
    queryKey: ['workflow-rule', ruleId],
    queryFn: async (): Promise<Rule> => {
      const data = await getWorkflowRule({ data: { ruleId } });
      return data as Rule;
    },
    enabled: true,
  });
}
