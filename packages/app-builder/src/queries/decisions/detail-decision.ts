import { DecisionDetails } from '@app-builder/models/decision';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';

const endpoint = (decisionId: string) =>
  getRoute('/ressources/decisions/:decisionId', {
    decisionId: fromUUIDtoSUUID(decisionId),
  });

export const useDetailDecisionQuery = (decisionId: string) => {
  return useQuery({
    queryKey: ['decisions', decisionId],
    queryFn: async () => {
      const response = await fetch(endpoint(decisionId));
      return response.json() as Promise<{ decision: DecisionDetails }>;
    },
  });
};
