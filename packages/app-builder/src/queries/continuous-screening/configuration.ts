import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (stableId: string) =>
  getRoute('/ressources/continuous-screening/configuration/:stableId', { stableId });

export const useContinuousScreeningConfigurationQuery = (stableId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['continuous-screening', 'configuration', stableId],
    queryFn: async () => {
      const response = await fetch(endpoint(stableId));
      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result.config as ContinuousScreeningConfig;
    },
  });
};
