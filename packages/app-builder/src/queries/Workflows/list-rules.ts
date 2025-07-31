import { type Rule } from '@app-builder/models/scenario/workflow';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useListRulesQuery(
  scenarioId: string,
): UseQueryResult<{ workflow: Rule[]; triggerObjectType: string }, Error> {
  return useQuery({
    queryKey: ['workflow-rules'],
    queryFn: async (): Promise<{ workflow: Rule[]; triggerObjectType: string }> => {
      const response = await fetch(`/ressources/workflows/${scenarioId}`);
      const data = await response.json();
      return data;
    },
  });
}
