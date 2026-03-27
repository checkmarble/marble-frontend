import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/cases/review-screening-match');

export const useBulkReviewMatchesMutation = () => {
  return useMutation({
    mutationFn: async (matchIds: string[]) => {
      const results = await Promise.all(
        matchIds.map(async (matchId) => {
          const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ matchId, status: 'no_hit' }),
          });
          return response.json();
        }),
      );
      return results;
    },
  });
};
