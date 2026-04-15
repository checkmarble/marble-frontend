import { loadMoreContinuousScreeningMatchesFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useLoadMoreContinuousScreeningMatchesMutation = (screeningId: string) => {
  const loadMoreContinuousScreeningMatches = useServerFn(loadMoreContinuousScreeningMatchesFn);

  return useMutation({
    mutationFn: async () => {
      await loadMoreContinuousScreeningMatches({ data: { screeningId } });
    },
  });
};
