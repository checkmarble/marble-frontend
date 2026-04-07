import { DecisionDetails } from '@app-builder/models/decision';
import { getDecisionFn } from '@app-builder/server-fns/decisions';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDetailDecisionQuery = (decisionId: string) => {
  const getDecision = useServerFn(getDecisionFn);

  return useQuery({
    queryKey: ['decisions', decisionId],
    queryFn: async () => getDecision({ data: { decisionId } }) as Promise<{ decision: DecisionDetails }>,
  });
};
