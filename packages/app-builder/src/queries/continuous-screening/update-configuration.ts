import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { PrevalidationCreateContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const endpoint = (configStableId: string) =>
  getRoute('/ressources/continuous-screening/update-configuration/:configStableId', { configStableId });

export const useUpdateContinuousScreeningConfigurationMutation = (configStableId: string) => {
  const queryClient = useQueryClient();
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['continuous-screening', 'update-configuration'],
    mutationFn: async (payload: PrevalidationCreateContinuousScreeningConfig) => {
      const response = await fetch(endpoint(configStableId), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['continuous-screening', 'configurations'] });
    },
  });
};
