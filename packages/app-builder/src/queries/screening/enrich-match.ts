import { enrichMatchFn } from '@app-builder/server-fns/screenings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useEnrichMatchMutation = () => {
  const enrichMatch = useServerFn(enrichMatchFn);

  return useMutation({
    mutationKey: ['screening', 'enrich-match'],
    mutationFn: async (matchId: string) => {
      return enrichMatch({ data: { matchId } });
    },
  });
};
