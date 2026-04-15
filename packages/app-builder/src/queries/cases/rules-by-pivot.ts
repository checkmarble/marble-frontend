import { type RuleWithSnoozeData } from '@app-builder/models/decision';
import { getRulesByPivotFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRulesByPivotQuery = (caseId: string) => {
  const getRulesByPivot = useServerFn(getRulesByPivotFn);

  return useQuery({
    queryKey: ['cases', 'rulesByPivot', caseId],
    queryFn: async () => {
      return getRulesByPivot({ data: { caseId } }) as Promise<{ rulesByPivot: Record<string, RuleWithSnoozeData[]> }>;
    },
  });
};
