import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ResponseReturnType } from '@app-builder/core/middleware-types';
import { type action } from '@app-builder/routes/ressources+/screenings+/refine';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefineScreeningPayload } from './schemas';

const endpoint = getRoute('/ressources/screenings/refine');

export const useRefineScreeningValidateMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['screening', 'refine'],
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
    onSuccess: (res) => {
      if (res?.success) {
        queryClient.invalidateQueries({ queryKey: ['cases', 'list-decisions'] });
      }
    },
  });
};
