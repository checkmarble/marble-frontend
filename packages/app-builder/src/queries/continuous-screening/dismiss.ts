import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = (screeningId: string) =>
  getRoute('/ressources/continuous-screening/dismiss/:screeningId', { screeningId });

export const useDismissContinuousScreeningMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(endpoint(id), {
        method: 'POST',
      });

      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
