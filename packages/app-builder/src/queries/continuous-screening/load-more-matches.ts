import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = (screeningId: string) =>
  getRoute('/ressources/continuous-screening/load-more/:screeningId', { screeningId });

export const useLoadMoreContinuousScreeningMatchesMutation = (screeningId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(endpoint(screeningId), {
        method: 'POST',
      });

      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
