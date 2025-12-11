import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ResponseReturnType } from '@app-builder/core/middleware-types';
import { type action } from '@app-builder/routes/ressources+/screenings+/search';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { RefineScreeningPayload } from './schemas';

const endpoint = getRoute('/ressources/screenings/search');

export const useRefineScreeningSearchMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['screening', 'search'],
    mutationFn: async (payload: RefineScreeningPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result as ResponseReturnType<typeof action>;
    },
  });
};
