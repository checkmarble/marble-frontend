import { RuleWithSnoozeData } from '@app-builder/routes/ressources+/cases+/$caseId.rules-by-pivot';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string) =>
  getRoute('/ressources/cases/:caseId/rules-by-pivot', {
    caseId: fromUUIDtoSUUID(caseId),
  });

export const useRulesByPivotQuery = (caseId: string) => {
  return useQuery({
    queryKey: ['cases', 'rulesByPivot', caseId],
    queryFn: async () => {
      const response = await fetch(endpoint(caseId));
      return response.json() as Promise<{ rulesByPivot: Record<string, RuleWithSnoozeData[]> }>;
    },
  });
};
