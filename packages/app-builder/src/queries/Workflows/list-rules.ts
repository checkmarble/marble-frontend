import { type Rule } from '@app-builder/models/scenario/workflow';
import { listWorkflowRulesFn } from '@app-builder/server-fns/workflows';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useListRulesQuery(
  scenarioId: string,
): UseQueryResult<{ workflow: Rule[]; triggerObjectType: string }, Error> {
  const listWorkflowRules = useServerFn(listWorkflowRulesFn);

  return useQuery({
    queryKey: ['workflow-rules', scenarioId],
    queryFn: async (): Promise<{ workflow: Rule[]; triggerObjectType: string }> => {
      const data = await listWorkflowRules({ data: { scenarioId } });
      return data as { workflow: Rule[]; triggerObjectType: string };
    },
  });
}
