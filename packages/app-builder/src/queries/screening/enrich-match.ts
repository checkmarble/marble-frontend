import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';

const endpoint = (matchId: string) =>
  getRoute('/ressources/sanction-check/enrich-match/:matchId', {
    matchId: fromUUIDtoSUUID(matchId),
  });

export const useEnrichMatchMutation = () => {
  return useMutation({
    mutationKey: ['screening', 'enrich-match'],
    mutationFn: async (matchId: string) => {
      const response = await fetch(endpoint(matchId), {
        method: 'POST',
      });

      return response.json();
    },
  });
};
